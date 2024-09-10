<template style="height: 100%">
  <v-sheet style="height: 80px" class="px-3">
    <VcsLabel>{{ itemTitle }}</VcsLabel>
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
    onMounted,
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
      itemTitle: {
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

      onMounted(() => {
        selectedLayer.value = currentItem.layerIndex;
      });

      return {
        selectedLayer,
        currentItem,
      };
    },
  });
</script>

<style scoped></style>
