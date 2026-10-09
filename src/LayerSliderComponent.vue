<template>
  <v-sheet class="px-3">
    <VcsLabel>{{ $st(title) }}</VcsLabel>
    <VcsSlider
      :step="1"
      :min="0"
      :ticks="labelsObject"
      :max="labels.length - 1"
      show-ticks="always"
      type="number"
      v-model="selectedLayer"
    />
  </v-sheet>
</template>

<script lang="ts">
  import { VSheet } from 'vuetify/components';
  import {
    defineComponent,
    inject,
    PropType,
    ref,
    watch,
    onUnmounted,
    onMounted,
    computed,
  } from 'vue';
  import { VcsSlider, VcsUiApp, VcsLabel } from '@vcmap/ui';
  import SliderContentTreeItem from './sliderContentTreeItem.js';

  export const windowIdLayerSlider = 'layerSlider_window_id';

  export default defineComponent({
    name: 'LayerSlider',
    components: {
      VcsSlider,
      VSheet,
      VcsLabel,
    },
    props: {
      labels: {
        type: Array as PropType<(string | undefined)[]>,
        required: true,
      },
      layerIndex: {
        type: Number,
        required: true,
      },
    },
    setup(props) {
      const app = inject('vcsApp') as VcsUiApp;
      const item = inject('sliderContentTreeItem') as SliderContentTreeItem;
      const selectedLayer = ref(props.layerIndex);

      watch(selectedLayer, (newValue: number) => {
        if (item.layerIndex !== newValue) {
          item.setLayer(newValue);
        }
      });

      const layerChangedListener = item.layerChanged.addEventListener(
        (state): void => {
          selectedLayer.value = state.layerIndex;
        },
      );

      const labelsObject = computed(() =>
        props.labels
          .map((value: string | undefined, index: number) => {
            if (value) {
              return { [index]: app.vueI18n.t(value) };
            }
            const layerName = item.getLayerNameAt(index);
            const layer = app.layers.getByKey(layerName);
            if (layer?.properties?.title) {
              return {
                [index]: app.vueI18n.t(layer.properties.title as string),
              };
            }
            return { [index]: layerName };
          })
          .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
      );

      onMounted(() => {
        selectedLayer.value = item.layerIndex;
      });
      onUnmounted(layerChangedListener);

      return {
        title: item.title,
        selectedLayer,
        labelsObject,
      };
    },
  });
</script>

<style scoped></style>
