import { WindowSlot } from '@vcmap/ui';
import { name } from '../package.json';
import { SliderContentTreeItemOptions } from './sliderContentTreeItem.js';

export type RequiredOptions = {
  name: string;
  title: string;
  actionIcon: string;
  actionTooltip: string;
  windowOptions: {
    slot: WindowSlot;
    position: { height: string | number; width: string | number };
    state: { headerTitle: string; headerIcon: string };
  };
  layerNames: Array<string>;
  labels: Array<string | undefined>;
};

const defaultItemOptions: RequiredOptions = {
  name,
  title: '',
  actionIcon: 'mdi-tune-variant',
  actionTooltip: 'layerSlider.openTooltip',
  windowOptions: {
    slot: WindowSlot.DYNAMIC_LEFT,
    position: { width: '400', height: '120' },
    state: { headerTitle: 'layerSlider.title', headerIcon: 'mdi-tune-variant' },
  },
  layerNames: [],
  labels: [],
};

export function fillOptionsWithDefaults(
  options: SliderContentTreeItemOptions,
): SliderContentTreeItemOptions & RequiredOptions {
  const defaultWindowOptions = defaultItemOptions.windowOptions;
  const layerNames = options.layerNames || defaultItemOptions.layerNames;
  const labels = options.labels || defaultItemOptions.labels;
  const seenLayerNames = new Set<string>();
  const uniqueLayerNames: string[] = [];
  const uniqueLabels: (string | undefined)[] = [];

  layerNames.forEach((layerName, index) => {
    if (!seenLayerNames.has(layerName)) {
      seenLayerNames.add(layerName);
      uniqueLayerNames.push(layerName);
      uniqueLabels.push(labels[index] ?? undefined);
    }
  });

  return {
    ...options,
    name: options.name || defaultItemOptions.name,
    title: options.title || defaultItemOptions.title,
    actionIcon: options.actionIcon || defaultItemOptions.actionIcon,
    actionTooltip: options.actionTooltip || defaultItemOptions.actionTooltip,
    windowOptions: {
      ...options.windowOptions,
      slot: options.windowOptions?.slot || defaultWindowOptions.slot,
      position: {
        width:
          options.windowOptions?.position?.width ||
          defaultWindowOptions.position.width,
        height:
          options.windowOptions?.position?.height ||
          defaultWindowOptions.position.height,
      },
      state: {
        headerTitle:
          (options.windowOptions?.state?.headerTitle as string) ||
          defaultWindowOptions.state.headerTitle,
        headerIcon:
          (options.windowOptions?.state?.headerIcon as string) ||
          defaultWindowOptions.state.headerIcon,
      },
    },
    layerNames: uniqueLayerNames,
    labels: uniqueLabels,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Removes in place every value equal to its default (and objects left empty).
 */
function removeDefaults(
  target: Record<string, unknown>,
  defaults: Record<string, unknown>,
): void {
  Object.entries(defaults).forEach(([key, defaultValue]) => {
    const value = target[key];
    if (isPlainObject(value) && isPlainObject(defaultValue)) {
      removeDefaults(value, defaultValue);
      if (Object.keys(value).length === 0) {
        delete target[key];
      }
    } else if (
      value === undefined ||
      JSON.stringify(value) === JSON.stringify(defaultValue)
    ) {
      delete target[key];
    }
  });
}

export function serializeOptions(
  options: Partial<SliderContentTreeItemOptions>,
): SliderContentTreeItemOptions {
  const serializedOptions = structuredClone(options) as Record<string, unknown>;
  removeDefaults(serializedOptions, defaultItemOptions);
  return serializedOptions as SliderContentTreeItemOptions;
}
