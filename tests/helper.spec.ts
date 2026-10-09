import { describe, expect, it } from 'vitest';
import { fillOptionsWithDefaults, serializeOptions } from '../src/helper.js';
import type { SliderContentTreeItemOptions } from '../src/sliderContentTreeItem.js';

const legacyOptions: SliderContentTreeItemOptions = {
  name: 'legacy-slider',
  title: 'Legacy slider',
  layerNames: ['layer-a'],
  labels: ['A'],
  windowOptions: {
    position: { width: '480px', height: '120px' },
    state: { headerTitle: 'Legacy header', headerIcon: 'mdi-image' },
  },
};

describe('slider config defaults and serialization', () => {
  it('fills action options for configs created before they existed', () => {
    const options = fillOptionsWithDefaults(legacyOptions);

    expect(options.actionIcon).toBe('mdi-tune-variant');
    expect(options.actionTooltip).toBe('layerSlider.openTooltip');
    expect(options.windowOptions.position.width).toBe('480px');
    expect(options.windowOptions.state.headerTitle).toBe('Legacy header');
  });

  it('preserves custom action options when serializing', () => {
    const options = fillOptionsWithDefaults(legacyOptions);
    const serialized = serializeOptions({
      ...options,
      actionIcon: 'mdi-image',
      actionTooltip: 'custom.openSlider',
    });

    expect(serialized.actionIcon).toBe('mdi-image');
    expect(serialized.actionTooltip).toBe('custom.openSlider');
  });

  it('removes duplicate layers with their corresponding labels', () => {
    const options = fillOptionsWithDefaults({
      ...legacyOptions,
      layerNames: ['layer-a', 'layer-b', 'layer-a', 'layer-c'],
      labels: ['A', 'B', 'Duplicate A', 'C'],
    });

    expect(options.layerNames).toEqual(['layer-a', 'layer-b', 'layer-c']);
    expect(options.labels).toEqual(['A', 'B', 'C']);
  });
});
