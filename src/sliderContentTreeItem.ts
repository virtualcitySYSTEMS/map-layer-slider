import {
  StateActionState,
  ContentTreeItem,
  ContentTreeItemOptions,
  WindowComponentOptions,
  VcsUiApp,
  WindowSlot,
  VcsAction,
} from '@vcmap/ui';
import { reactive } from 'vue';
import { VcsEvent } from '@vcmap/core';
import { name } from '../package.json';
import LayerSlider from './LayerSliderComponent.vue';

export type SliderContentTreeItemOptions = ContentTreeItemOptions & {
  windowOptions: Partial<WindowComponentOptions>;
  layerNames: Array<string>;
  labels: Array<string>;
};

type LayerChangedEventPayload = {
  layerIndex: number;
  isActive: boolean;
};

class SliderContentTreeItem extends ContentTreeItem {
  static get className(): string {
    return 'SliderContentTreeItem';
  }

  private readonly _windowOptions: WindowComponentOptions;

  private _listeners: Array<() => void>;

  private _layerIndex: number;

  public layerChanged: VcsEvent<LayerChangedEventPayload>;

  private readonly _layerNames: Array<string>;

  private readonly _labels: Array<string>;

  public _app: VcsUiApp;

  private activateAction: VcsAction;

  constructor(options: SliderContentTreeItemOptions, app: VcsUiApp) {
    super(options, app);
    this.state = StateActionState.INACTIVE;
    this._layerNames = options.layerNames || [];
    this._labels = options.labels || [];
    this._layerIndex = 0;
    this._windowOptions = {
      id: options.name,
      component: LayerSlider,
      slot: options.windowOptions?.slot || WindowSlot.DYNAMIC_LEFT,
      position: {
        width: options.windowOptions?.position?.width || '400px',
        height: options.windowOptions?.position?.height || '110px',
      },
      state: {
        headerTitle:
          options.windowOptions?.state?.headerTitle || 'layerSlider.title',
        headerIcon:
          options.windowOptions?.state?.headerIcon || 'mdi-tune-variant',
        infoUrlCallback:
          options.windowOptions?.state?.infoUrlCallback ||
          app.getHelpUrlCallback('/tools/layerSlider.html'),
      },
      props: {
        labels: this._labels,
        layerIndex: this._layerIndex,
        itemName: options.name,
      },
    };
    this.layerChanged = new VcsEvent<LayerChangedEventPayload>();
    this._listeners = [];
    this._app = app;

    this.activateAction = reactive({
      name: 'open',
      icon: 'mdi-tune-variant',
      title: 'layerSlider.openTooltip',
      active: false,
      callback: async () => {
        if (this.activateAction.active === true) {
          this.activateAction.active = false;
          if (this._app.windowManager.has(this._windowOptions.id!)) {
            this._app.windowManager.remove(this._windowOptions.id!);
          }
        } else {
          this.activateAction.active = true;
          await this.activate();
        }
      },
    });
    this._setup();
  }

  async activate(): Promise<void> {
    this.state = StateActionState.ACTIVE;
    this.activateAction.active = true;

    // Deactivate all layers except the current one
    for (let i = 0; i < this._layerNames.length; i++) {
      if (i !== this._layerIndex) {
        const layerName = this._layerNames[i];
        const layer = this._app.layers.getByKey(layerName);
        if (layer) {
          layer.deactivate();
        }
      }
    }

    // Activate the current layer
    const currentLayerName = this._layerNames[this._layerIndex];
    const currentLayer = this._app.layers.getByKey(currentLayerName);
    if (currentLayer) {
      await currentLayer.activate();
    }

    // Open the window
    if (!this._app.windowManager.has(this._windowOptions.id!)) {
      this._app.windowManager.add(this._windowOptions, name);
    }
  }

  deactivate(): void {
    this.state = StateActionState.INACTIVE;

    // Deactivate all layers
    for (let i = 0; i < this._layerNames.length; i++) {
      const layerName = this._layerNames[i];
      const layer = this._app.layers.getByKey(layerName);
      if (layer) {
        layer.deactivate();
      }
    }

    // Close the window
    if (this._app.windowManager.has(this._windowOptions.id!)) {
      this._app.windowManager.remove(this._windowOptions.id!);
    }
  }

  // New setLayer function
  setLayer(index: number): void {
    this.layerIndex = index; // Update layer index

    this.layerChanged.raiseEvent({ layerIndex: index, isActive: true });

    // Deactivate all layers
    for (let i = 0; i <= this._layerNames.length; i++) {
      if (i !== index) {
        const layerName = this._layerNames[i];
        const layer = this._app.layers.getByKey(layerName);
        if (layer) {
          layer.deactivate();
        }
      }
    }

    // Activate the selected layer
    const selectedLayer = this._app.layers.getByKey(this._layerNames[index]);
    if (selectedLayer) {
      selectedLayer.activate().catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error activating layer:', error);
      });
    }
  }

  get layerIndex(): number {
    return this._layerIndex;
  }

  set layerIndex(ind: number) {
    this._layerIndex = ind;
  }

  private _clearListeners(): void {
    this._listeners.forEach((cb): void => {
      cb();
    });
    this._listeners.splice(0);
  }

  private _setup(): void {
    this._clearListeners();

    this._listeners = [
      this._app.windowManager.removed.addEventListener(
        ({ id }: { id: string }): void => {
          if (id === `${this._windowOptions.id}`) {
            this.activateAction.active = false;
          }
        },
      ),

      this._app.layers.stateChanged.addEventListener((layer): void => {
        if (this._layerNames.includes(layer.name)) {
          const layerIndex = this._layerNames.indexOf(layer.name);
          if (layer.active) {
            this.setLayer(layerIndex);
          } else if (!layer.loading) {
            if (layerIndex === this._layerIndex) {
              if (this._app.windowManager.has(this._windowOptions.id!)) {
                this._app.windowManager.remove(this._windowOptions.id!);
                this.state = StateActionState.INACTIVE;
              }
            }
          }
        }
      }),
    ];

    this.addAction(this.activateAction, 12);
  }

  async clicked(): Promise<void> {
    await super.clicked();
    if (this.state === StateActionState.INACTIVE) {
      await this.activate();
    } else {
      this.deactivate();
    }
  }

  destroy(): void {
    super.destroy();
    this._clearListeners();
  }

  toJSON(): SliderContentTreeItemOptions {
    const config = super.toJSON() as SliderContentTreeItemOptions;

    config.windowOptions = {
      id: this._windowOptions.id,
      slot: this._windowOptions.slot,
      position: {
        width: this._windowOptions.position?.width,
        height: this._windowOptions.position?.height,
      },
      state: {
        headerTitle: this._windowOptions.state?.headerTitle,
        headerIcon: this._windowOptions.state?.headerIcon,
        infoUrlCallback: this._windowOptions.state?.infoUrlCallback,
      },
    };
    config.layerNames = structuredClone(this._layerNames);
    config.labels = structuredClone(this._labels);

    return config;
  }
}

export default SliderContentTreeItem;
