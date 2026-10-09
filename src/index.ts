import {
  ContentTreeItem,
  PluginConfigEditor,
  VcsPlugin,
  VcsUiApp,
} from '@vcmap/ui';
import { Ctor, moduleIdSymbol } from '@vcmap/core';
import { mapVersion, name, version } from '../package.json';
import SliderContentTreeItem from './sliderContentTreeItem.js';
import ConfigEditor from './ConfigEditor.vue';

type PluginConfig = Record<never, never>;
type PluginState = Record<never, never>;

export type LayerSliderPlugin = VcsPlugin<PluginConfig, PluginState>;

export default function plugin(): LayerSliderPlugin {
  let removeRegistration: (() => void) | undefined;

  return {
    get name(): string {
      return name;
    },
    get version(): string {
      return version;
    },
    get mapVersion(): string {
      return mapVersion;
    },

    initialize(app: VcsUiApp): void {
      removeRegistration?.();
      const moduleId = this[moduleIdSymbol] || app.dynamicModuleId;
      app.contentTreeClassRegistry.registerClass(
        moduleId,
        SliderContentTreeItem.className,
        SliderContentTreeItem as Ctor<typeof ContentTreeItem>,
      );
      removeRegistration = (): void => {
        app.contentTreeClassRegistry.unregisterClass(
          moduleId,
          SliderContentTreeItem.className,
        );
      };
    },
    getConfigEditors(): PluginConfigEditor<PluginConfig>[] {
      return [
        {
          component: ConfigEditor,
          title: 'layerSlider.name',
          collectionName: 'contentTree',
          itemName: SliderContentTreeItem.className,
        },
      ];
    },
    i18n: {
      de: {
        layerSlider: {
          title: 'Schieberegler',
          name: 'Ebenen Schieberegler',
          openTooltip: 'Schieberegler öffnen',
          error: {
            itemTitle: 'Titel ist erforderlich',
            itemName: 'Name ist erforderlich',
          },
          config: {
            itemName: 'Name (ContentTreeItem ID)',
            itemTitle: 'ContentTreeItem Titel',
            width: 'Fensterbreite',
            height: 'Fensterhöhe',
            title: 'Fensterkopf Titel',
            icon: 'Fensterkopf Icon',
            actionTooltip: 'Content-tree Aktion Tooltip',
            actionIcon: 'Content-tree Aktion Icon',
            heading: 'Ticks des Sliders (Ebenenname - Label)',
            tickEditor: {
              heading: 'Tick-Editor des Sliders',
              help: 'Erstellen oder bearbeiten Sie Slider-Ticks. Jeder Tick aktiviert die ihm zugewiesene Ebene und zeigt das angegebene Label an. Wenn kein Label angegeben ist, wird der Titel der Ebene verwendet. Ist auch kein Titel vorhanden, wird ihr Name angezeigt.',
              layer: 'Ebene',
              label: 'Label-Eintrag',
            },
          },
        },
      },
      en: {
        layerSlider: {
          title: 'Slider',
          name: 'Layer Slider',
          openTooltip: 'Open layer slider',
          error: {
            itemTitle: 'Title is required',
            itemName: 'Name is required',
          },
          config: {
            itemName: 'Name (ContentTreeItem ID)',
            itemTitle: 'ContentTreeItem title',
            width: 'Window width',
            height: 'Window height',
            title: 'Window header title',
            icon: 'Window header icon',
            actionTooltip: 'Content-tree action tooltip',
            actionIcon: 'Content-tree action icon',
            heading: "Slider's ticks (layer name - label)",
            tickEditor: {
              heading: "Slider's tick editor",
              help: 'Create or edit slider ticks. Each tick activates its assigned layer and displays the specified label. If no label is provided, the layer’s title is used, falling back to its name.',
              layer: 'Layer',
              label: 'Label entry',
            },
          },
        },
      },
    },
    destroy(): void {
      removeRegistration?.();
      removeRegistration = undefined;
    },
  };
}
