<template style="height: 100%">
  <v-sheet class="px-3">
    <VcsLabel>{{ itemTitle }}</VcsLabel>
    <VcsSlider
      :step="1"
      :min="0"
      :ticks="labelsObject"
      :max="labels.length - 1"
      show-ticks="always"
      type="number"
      v-model="selectedLayer"
    >
    </VcsSlider>
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

      watch(selectedLayer, (newValue: number) => {
        if (currentItem.layerIndex !== newValue) {
          currentItem.setLayer(newValue);
        }
      });

      const layerChangedListener = currentItem.layerChanged.addEventListener(
        (state): void => {
          selectedLayer.value = state.layerIndex;
        },
      );

      type LabelsObjectType = { [key: number]: string };

      const labelsObject = computed(() => {
        const result: LabelsObjectType = {};
        props.labels.forEach((value: string, index: number) => {
          result[index] = value;
        });
        return result;
      });

      onUnmounted(() => {
        layerChangedListener();
      });

      onMounted(() => {
        selectedLayer.value = currentItem.layerIndex;
      });

      return {
        labelsObject,
        selectedLayer,
        currentItem,
      };
    },
  });
</script>

<style scoped></style>
