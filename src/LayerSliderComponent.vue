<template style="height: 100%">
  <v-sheet style="height: 70px">
    <VcsSlider
      :step="1"
      :min="0"
      :max="labels.length - 1"
      ticks
      type="number"
      :tick-labels="labels"
      v-model="selectedLayer"
    >
    </VcsSlider>
  </v-sheet>
</template>

<script lang="ts">
  import { VSheet } from 'vuetify/lib';
  import {
    defineComponent,
    inject,
    PropType,
    ref,
    watch,
    onUnmounted,
  } from 'vue';
  import { VcsSlider, VcsUiApp } from '@vcmap/ui';
  import SliderContentTreeItem from './sliderContentTreeItem.js';

  export const windowIdLayerSlider = 'layerSlider_window_id';
  export default defineComponent({
    name: 'LayerSlider',
    components: {
      VcsSlider,
      VSheet,
    },
    props: {
      labels: {
        type: Array as PropType<string[]>,
        required: true,
      },
      layerIndex: {
        type: Number,
        required: true,
      },
      itemName: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      const app = inject('vcsApp') as VcsUiApp;
      const currentItem = app.contentTree.getByKey(
        props.itemName,
      ) as SliderContentTreeItem;
      const selectedLayer = ref(props.layerIndex);

      watch(selectedLayer, (newValue) => {
        if (currentItem.layerIndex !== newValue) {
          currentItem.setLayer(newValue);
        }
      });

      const layerChangedListener = currentItem.layerChanged.addEventListener(
        (state): void => {
          selectedLayer.value = state.layerIndex;
        },
      );

      onUnmounted(() => {
        layerChangedListener();
      });

      return {
        selectedLayer,
        currentItem,
      };
    },
  });
</script>

<style scoped></style>
