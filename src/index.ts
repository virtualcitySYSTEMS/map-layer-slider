import {
  ContentTreeItem,
  PluginConfigEditor,
  VcsPlugin,
  VcsUiApp,
} from '@vcmap/ui';
import { Ctor, moduleIdSymbol } from '@vcmap/core';
import { Component } from 'vue';
import { mapVersion, name, version } from '../package.json';
import SliderContentTreeItem from './sliderContentTreeItem.js';
import layerSliderConfigEditor from './layerSliderConfigEditor.vue';

export type PluginConfig = object;

type PluginState = Record<never, never>;

export type LayerSliderPlugin = VcsPlugin<PluginConfig, PluginState>;

export default function plugin(): LayerSliderPlugin {
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

    initialize(): Promise<void> {
      return Promise.resolve();
    },
    onVcsAppMounted(vcsUiApp: VcsUiApp): void {
      vcsUiApp.contentTreeClassRegistry.registerClass(
        this[moduleIdSymbol] || vcsUiApp.dynamicModuleId,
        SliderContentTreeItem.className,
        SliderContentTreeItem as unknown as Ctor<typeof ContentTreeItem>,
      );
    },
    /**
     * should return all default values of the configuration
     */
    getDefaultOptions(): PluginConfig {
      return {};
    },
    /**
     * should return the plugin's serialization excluding all default values
     */
    toJSON(): PluginConfig {
      return {};
    },
    /**
     * should return the plugins state
     * @returns {PluginState}
     */
    getState(): PluginState {
      return {};
    },
    /**
     * components for configuring the plugin and/ or custom items defined by the plugin
     */
    getConfigEditors(): PluginConfigEditor<PluginConfig>[] {
      return [
        {
          component: layerSliderConfigEditor as unknown as Component & {
            title: string;
          },
          collectionName: 'contentTree',
          itemName: SliderContentTreeItem.className,
        },
      ];
    },
    i18n: {
      de: {
        layerSlider: {
          title: 'Schieberegler',
          name: 'Ebenen Schieberegler Editor',
          openTooltip: 'Schiebereglerfenster öffnen',
          error: {
            itemTitle: 'Bitte geben Sie einen Title an',
            itemName: 'Bitte geben Sie einen Namen an',
          },
          configEditor: {
            itemName: 'Name (ID)',
            itemTitle: 'Titel',
            itemWidth: 'Breite',
            itemHeight: 'Höhe',
            headerTitleInput: 'Schieberegler Titel',
            headerIconInput: 'Schieberegler Icon',
            heading: 'Layername (Label)',
            labelName: 'Labelname',
            layerName: 'Layername',
          },
        },
      },
      en: {
        layerSlider: {
          title: 'Slider',
          name: 'Layer Slider Editor',
          openTooltip: 'Open Slider Window',
          error: {
            itemTitle: 'Please enter a title',
            itemName: 'Please enter a name',
          },
          configEditor: {
            itemName: 'Name (ID)',
            itemTitle: 'Title',
            itemWidth: 'Width',
            itemHeight: 'Height',
            headerTitleInput: 'Slider Title',
            headerIconInput: 'Slider Icon',
            heading: 'Layer Name (Label)',
            labelName: 'Label Name',
            layerName: 'Layer Name',
          },
        },
      },
    },
    destroy(): void {},
  };
}
