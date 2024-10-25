<template>
  <AbstractConfigEditor
    @submit="apply"
    v-if="localConfig"
    v-bind="{ ...$attrs, ...$props }"
  >
    <v-container class="py-0 px-1">
      <v-row no-gutters>
        <v-col cols="4">
          <VcsLabel html-for="nameInput" required>
            {{ $st('layerSlider.configEditor.itemName') }}
          </VcsLabel>
        </v-col>
        <v-col cols="8">
          <VcsTextField
            hide-details
            v-model="itemName"
            :error="!itemName"
            :rules="[ruleName]"
            required
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="4">
          <VcsLabel html-for="titleInput" required>
            {{ $st('layerSlider.configEditor.itemTitle') }}
          </VcsLabel>
        </v-col>
        <v-col cols="8">
          <VcsTextField
            hide-details
            v-model="itemTitle"
            :error="!itemTitle"
            :rules="[ruleTitle]"
            required
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="4">
          <VcsLabel html-for="widthInput">
            {{ $st('layerSlider.configEditor.itemWidth') }}
          </VcsLabel>
        </v-col>
        <v-col cols="8">
          <VcsTextField
            type="number"
            step="10"
            hide-details
            v-model="itemWidth"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="4">
          <VcsLabel html-for="heightInput">
            {{ $st('layerSlider.configEditor.itemHeight') }}
          </VcsLabel>
        </v-col>
        <v-col cols="8">
          <VcsTextField
            type="number"
            step="10"
            hide-details
            v-model="itemHeight"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="4">
          <VcsLabel html-for="headerTitleInput">
            {{ $st('layerSlider.configEditor.headerTitleInput') }}
          </VcsLabel>
        </v-col>
        <v-col cols="8">
          <VcsTextField hide-details v-model="itemHeaderTitle" />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="4">
          <VcsLabel html-for="headerIconInput">
            {{ $st('layerSlider.configEditor.headerIconInput') }}
          </VcsLabel>
        </v-col>
        <v-col cols="8">
          <VcsTextField hide-details v-model="itemHeaderIcon" />
        </v-col>
      </v-row>
    </v-container>
    <VcsFormSection
      heading="layerSlider.configEditor.heading"
      :start-open="true"
      :header-actions="headerActions"
    >
      <VcsList
        :items="listItems"
        :draggable="true"
        @item-moved="move"
        :show-title="false"
      />

      <v-dialog
        v-if="layerLabelOptions"
        :model-value="true"
        width="400"
        :persistent="true"
      >
        <LayerLabelsEdit
          v-model="layerLabelOptions"
          @close="layerLabelOptions = undefined"
        />
      </v-dialog>
    </VcsFormSection>
  </AbstractConfigEditor>
</template>

<script lang="ts">
  import {
    AbstractConfigEditor,
    VcsFormSection,
    VcsLabel,
    VcsList,
    VcsListItem,
    VcsTextField,
  } from '@vcmap/ui';
  import {
    computed,
    defineComponent,
    getCurrentInstance,
    PropType,
    Ref,
    ref,
    toRaw,
    watch,
  } from 'vue';
  import { getLogger } from '@vcsuite/logger';
  import { VRow, VCol, VDialog, VContainer } from 'vuetify/components';
  import { name } from '../package.json';
  import LayerLabelsEdit from './LayerLabelsEdit.vue';
  import { SliderContentTreeItemOptions } from './sliderContentTreeItem.js';

  type WindowOptions = {
    position: {
      height?: string;
      width?: string;
    };
    state: {
      headerTitle: string;
      headerIcon: string;
    };
  };

  interface VcsListItemWithLabel extends VcsListItem {
    label: string;
  }

  export default defineComponent({
    name: 'LayerSliderConfigEditor',
    title: 'layerSlider.name',
    components: {
      VDialog,
      VcsList,
      VcsFormSection,
      VRow,
      VcsLabel,
      AbstractConfigEditor,
      VcsTextField,
      VCol,
      LayerLabelsEdit,
      VContainer,
    },
    props: {
      getConfig: {
        type: Function as PropType<() => SliderContentTreeItemOptions>,
        required: true,
      },
      setConfig: {
        type: Function as PropType<
          (config?: SliderContentTreeItemOptions) => void
        >,
        required: true,
      },
    },

    setup(props) {
      const localConfig = ref<SliderContentTreeItemOptions>(props.getConfig());

      const vm = getCurrentInstance()!.proxy;

      const editLayerNamesAtIndex: Ref<number | undefined> = ref();

      const itemName = ref();
      const itemTitle = ref();
      const itemHeight = ref();
      const itemWidth = ref();
      const itemHeaderTitle = ref();
      const itemHeaderIcon = ref();
      const itemLayerNames = ref();
      const itemLabels = ref();

      const listItems: Ref<VcsListItemWithLabel[] | undefined> = ref(undefined);

      itemName.value = localConfig.value.name;
      itemTitle.value = localConfig.value.title;
      itemHeight.value = localConfig.value.windowOptions?.position?.height;
      itemWidth.value = localConfig.value.windowOptions?.position?.width;
      itemHeaderTitle.value =
        localConfig.value.windowOptions?.state?.headerTitle;
      itemHeaderIcon.value = localConfig.value.windowOptions?.state?.headerIcon;
      if (!localConfig.value.labels) {
        localConfig.value.labels = [];
      }
      itemLabels.value = localConfig.value.labels;

      if (!localConfig.value.layerNames) {
        localConfig.value.layerNames = [];
      }
      itemLayerNames.value = localConfig.value.layerNames;

      const apply = (): void => {
        if (localConfig.value) {
          localConfig.value.name = itemName.value;
          localConfig.value.title = itemTitle.value;
          if (!localConfig.value.windowOptions) {
            localConfig.value.windowOptions = { position: {} } as WindowOptions;
          }
          if (!localConfig.value.windowOptions.position) {
            localConfig.value.windowOptions.position = {};
          }
          localConfig.value.windowOptions.position.height = itemHeight.value;
          localConfig.value.windowOptions.position.width = itemWidth.value;
          if (!localConfig.value.windowOptions.state) {
            localConfig.value.windowOptions.state = {};
          }
          localConfig.value.windowOptions.state.headerTitle =
            itemHeaderTitle.value;
          localConfig.value.windowOptions.state.headerIcon =
            itemHeaderIcon.value;
          localConfig.value.labels = toRaw(itemLabels.value);
          localConfig.value.layerNames = toRaw(itemLayerNames.value);
          props.setConfig(toRaw(localConfig.value));
        }
      };

      function createListItem(
        layerNamesConfig: string,
        index: number,
      ): VcsListItemWithLabel {
        return {
          name: layerNamesConfig,
          title: `${layerNamesConfig} (${localConfig.value?.labels[index] || 'no Label'})`,
          label: localConfig.value?.labels[index],
          actions: [
            {
              name: 'edit',
              icon: '$vcsEdit',
              callback(): void {
                editLayerNamesAtIndex.value = index;
              },
            },
            {
              name: 'linkButton.editor.remove',
              icon: '$vcsTrashCan',
              callback(): void {
                if (localConfig.value?.layerNames) {
                  localConfig.value.layerNames.splice(index, 1);
                  localConfig.value.labels.splice(index, 1);
                  listItems.value =
                    localConfig.value?.layerNames?.map(createListItem);
                }
              },
            },
          ],
        };
      }

      watch(
        localConfig,
        (config) => {
          if (config?.layerNames) {
            listItems.value = config.layerNames.map((layerName, index) =>
              createListItem(layerName, index),
            );
          } else {
            listItems.value = [];
          }
        },
        { immediate: true },
      );

      return {
        itemName,
        itemTitle,
        itemHeight,
        itemWidth,
        itemHeaderTitle,
        itemHeaderIcon,
        itemLabels,
        itemLayerNames,
        apply,
        localConfig,
        listItems,
        headerActions: [
          {
            name: 'linkButton.editor.add',
            icon: '$vcsPlus',
            callback(): void {
              if (localConfig.value?.layerNames) {
                listItems.value =
                  localConfig.value.layerNames.map(createListItem);
                editLayerNamesAtIndex.value =
                  localConfig.value.layerNames.push('empty Layer') - 1;
              } else {
                getLogger(name).error('no local config available');
              }
            },
          },
        ],
        layerLabelOptions: computed({
          get() {
            if (editLayerNamesAtIndex.value !== undefined) {
              return {
                layerName:
                  localConfig.value?.layerNames?.[editLayerNamesAtIndex.value],
                label: localConfig.value?.labels?.[editLayerNamesAtIndex.value],
              };
            } else {
              return undefined;
            }
          },
          set(value) {
            if (
              value &&
              editLayerNamesAtIndex.value !== undefined &&
              localConfig.value?.layerNames
            ) {
              localConfig.value.layerNames[editLayerNamesAtIndex.value] =
                value.layerName;
              localConfig.value.labels[editLayerNamesAtIndex.value] =
                value.label;
              listItems.value =
                localConfig.value.layerNames.map(createListItem);
            } else {
              editLayerNamesAtIndex.value = undefined;
            }
          },
        }),
        move({
          item,
          targetIndex,
        }: {
          item: VcsListItemWithLabel;
          targetIndex: number;
        }): void {
          if (listItems.value) {
            let target = targetIndex;
            target = target >= 0 ? target : 0;
            target =
              target < listItems.value.length
                ? target
                : listItems.value.length - 1;
            const from = listItems.value.indexOf(item);
            if (from !== target) {
              listItems.value.splice(from, 1);
              listItems.value.splice(target, 0, item);

              localConfig.value?.layerNames.splice(from, 1);
              localConfig.value?.layerNames.splice(target, 0, item.name);

              localConfig.value?.labels.splice(from, 1);
              localConfig.value?.labels.splice(target, 0, item.label);
            }
          }
        },
        ruleName: (v: string): string | boolean =>
          !!v || vm!.$st('layerSlider.error.itemName'),
        ruleTitle: (v: string): string | boolean =>
          !!v || vm!.$st('layerSlider.error.itemName'),
      };
    },
  });
</script>

<style scoped></style>
