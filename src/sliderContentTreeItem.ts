import {
  StateActionState,
  ContentTreeItem,
  ContentTreeItemOptions,
  WindowComponentOptions,
  VcsUiApp,
  VcsAction,
  executeCallbacks,
} from '@vcmap/ui';
import { reactive } from 'vue';
import { VcsEvent } from '@vcmap/core';
import { name } from '../package.json';
import LayerSlider from './LayerSliderComponent.vue';
import {
  fillOptionsWithDefaults,
  RequiredOptions,
  serializeOptions,
} from './helper.js';

export type SliderContentTreeItemOptions = ContentTreeItemOptions & {
  actionIcon?: string;
  actionTooltip?: string;
  windowOptions: Partial<WindowComponentOptions>;
  layerNames: Array<string>;
  labels: Array<string | undefined>;
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

  private readonly _windowConfig: RequiredOptions['windowOptions'];

  private _listeners: Array<() => void>;

  private _layerIndex: number;

  private _destroyed = false;

  public layerChanged: VcsEvent<LayerChangedEventPayload>;

  private readonly _layerNames: Array<string>;

  private readonly _labels: Array<string | undefined>;

  public _app: VcsUiApp;

  private activateAction: VcsAction;

  constructor(options: SliderContentTreeItemOptions, app: VcsUiApp) {
    const filledOptions = fillOptionsWithDefaults(options);
    super(filledOptions, app);
    this._app = app;
    this.state = StateActionState.INACTIVE;
    // TODO: consider filtering the layer names to only include those that exist in the app's layer collection
    this._layerNames = filledOptions.layerNames;
    this._labels = filledOptions.labels;
    this.title = filledOptions.title;
    this.visible = this._layerNames.length > 0;
    this._layerIndex = 0;
    this._windowConfig = filledOptions.windowOptions;
    const { slot, position, state } = this._windowConfig;
    this._windowOptions = {
      id: filledOptions.name,
      component: LayerSlider,
      slot,
      position: { ...position },
      state: { ...state },
      provides: { sliderContentTreeItem: this },
      props: {
        labels: this._labels,
        layerIndex: this._layerIndex,
      },
    };
    this.layerChanged = new VcsEvent<LayerChangedEventPayload>();
    this._listeners = [];

    this.activateAction = reactive({
      name: `open-slider-${filledOptions.name}`,
      icon: filledOptions.actionIcon,
      title: filledOptions.actionTooltip,
      active: false,
      callback: async () => {
        if (this._destroyed) {
          return;
        }
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
    if (this._destroyed) {
      return;
    }
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

    if (this._destroyed) {
      return;
    }

    // Open the window
    if (!this._app.windowManager.has(this._windowOptions.id!)) {
      this._app.windowManager.add(this._windowOptions, name);
    }
    executeCallbacks(this._app, this._onActivate);
  }

  deactivate(): void {
    if (this._destroyed) {
      return;
    }
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
    executeCallbacks(this._app, this._onDeactivate);
  }

  // New setLayer function
  setLayer(index: number): void {
    if (this._destroyed) {
      return;
    }
    this.layerIndex = index; // Update layer index

    this.layerChanged.raiseEvent({ layerIndex: index, isActive: true });

    // Deactivate all layers
    for (let i = 0; i < this._layerNames.length; i++) {
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

  getLayerNameAt(index: number): string {
    return this._layerNames[index];
  }

  private _clearListeners(): void {
    this._listeners.forEach((cb): void => {
      cb();
    });
    this._listeners.splice(0);
  }

  private _updateActivateAction(): void {
    if (this._layerNames.length < 2) {
      this.removeAction(this.activateAction.name);
    } else if (
      !this.getTreeViewItem().actions.some(
        (action) => action.name === this.activateAction.name,
      )
    ) {
      this.addAction(this.activateAction, 12);
    }
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
        this.visible = this._layerNames.length > 0;
        this._updateActivateAction();
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

    this._updateActivateAction();
  }

  async clicked(): Promise<void> {
    await super.clicked();
    if (this.state === StateActionState.INACTIVE) {
      await this.activate();
    } else {
      this.deactivate();
    }
  }

  toJSON(): SliderContentTreeItemOptions {
    return serializeOptions({
      ...(super.toJSON() as SliderContentTreeItemOptions),
      windowOptions: structuredClone(this._windowConfig),
      layerNames: structuredClone(this._layerNames),
      labels: structuredClone(this._labels),
    });
  }

  destroy(): void {
    if (this._destroyed) {
      return;
    }
    this._destroyed = true;
    this._clearListeners();
    if (this._app.windowManager.has(this._windowOptions.id!)) {
      this._app.windowManager.remove(this._windowOptions.id!);
    }
    this.removeAction(this.activateAction.name);
    this.layerChanged.destroy();
    super.destroy();
  }
}

export default SliderContentTreeItem;
