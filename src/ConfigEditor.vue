<template>
  <AbstractConfigEditor @submit="apply" v-bind="{ ...$attrs, ...$props }">
    <v-container class="py-0 px-1">
      <v-row no-gutters>
        <v-col>
          <VcsLabel html-for="nameInput" required>
            {{ $st('layerSlider.config.itemName') }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField
            id="nameInput"
            v-model="itemName"
            :rules="[(v: string) => !!v || 'layerSlider.error.itemName']"
            required
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <VcsLabel html-for="titleInput" required>
            {{ $st('layerSlider.config.itemTitle') }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField
            id="titleInput"
            v-model="itemTitle"
            :rules="[(v: string) => !!v || 'layerSlider.error.itemTitle']"
            required
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <VcsLabel html-for="width">
            {{ $st('layerSlider.config.width') }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField
            id="width"
            type="number"
            unit="px"
            step="10"
            v-model="itemWidth"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <VcsLabel html-for="height">
            {{ $st('layerSlider.config.height') }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField
            id="height"
            type="number"
            unit="px"
            step="10"
            v-model="itemHeight"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <VcsLabel html-for="title">
            {{ $st('layerSlider.config.title') }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField id="title" v-model="itemHeaderTitle" />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <VcsLabel html-for="icon">
            {{ $st('layerSlider.config.icon') }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField id="icon" v-model="itemHeaderIcon" />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <VcsLabel html-for="actionTooltip">
            {{ $st('layerSlider.config.actionTooltip') }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField id="actionTooltip" v-model="itemActionTooltip" />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <VcsLabel html-for="actionIcon">
            {{ $st('layerSlider.config.actionIcon') }}
          </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField id="actionIcon" v-model="itemActionIcon" />
        </v-col>
      </v-row>
    </v-container>
    <VcsFormSection
      heading="layerSlider.config.heading"
      start-open
      :header-actions="headerActions"
    >
      <VcsList
        :items="listItems"
        draggable
        :show-title="false"
        @item-moved="move"
      />

      <v-dialog v-if="tickOptions" :model-value="true" width="400" persistent>
        <TickEditor
          v-model="tickOptions"
          :selected-layers="selectedLayers"
          @close="closeLayerLabelsEdit"
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
    VcsUiApp,
  } from '@vcmap/ui';
  import { computed, defineComponent, inject, PropType, ref, toRaw } from 'vue';
  import { VRow, VCol, VDialog, VContainer } from 'vuetify/components';
  import TickEditor from './TickEditor.vue';
  import type { RequiredOptions } from './helper.js';
  import { fillOptionsWithDefaults, serializeOptions } from './helper.js';
  import { SliderContentTreeItemOptions } from './sliderContentTreeItem.js';

  interface VcsListItemWithLabel extends VcsListItem {
    label: string | undefined;
  }

  export default defineComponent({
    name: 'ConfigEditor',
    components: {
      VCol,
      VContainer,
      VDialog,
      VRow,
      AbstractConfigEditor,
      VcsFormSection,
      VcsLabel,
      VcsList,
      VcsTextField,
      TickEditor,
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
      const app = inject('vcsApp') as VcsUiApp;
      const localConfig = ref<RequiredOptions>(
        fillOptionsWithDefaults(props.getConfig()),
      );

      const { windowOptions } = localConfig.value;
      const editLayerNamesAtIndex = ref<number>();
      const listItems = ref<VcsListItemWithLabel[]>([]);
      const isAddingLayerLabel = ref(false);

      const itemName = ref(localConfig.value.name);
      const itemTitle = ref(localConfig.value.title);
      const itemWidth = ref(windowOptions?.position?.width);
      const itemHeight = ref(windowOptions?.position?.height);
      const itemHeaderTitle = ref(windowOptions?.state?.headerTitle);
      const itemHeaderIcon = ref(windowOptions?.state?.headerIcon);
      const itemActionTooltip = ref(localConfig.value.actionTooltip);
      const itemActionIcon = ref(localConfig.value.actionIcon);
      const apply = (): void => {
        const rawConfig = toRaw(localConfig.value);
        const serializedConfig = serializeOptions({
          ...rawConfig,
          name: itemName.value,
          title: itemTitle.value,
          actionIcon: itemActionIcon.value,
          actionTooltip: itemActionTooltip.value,
          windowOptions: {
            ...rawConfig.windowOptions,
            position: { width: itemWidth.value, height: itemHeight.value },
            state: {
              headerTitle: itemHeaderTitle.value,
              headerIcon: itemHeaderIcon.value,
            },
          },
          layerNames: toRaw(localConfig.value.layerNames),
          labels: toRaw(localConfig.value.labels),
        });
        props.setConfig(structuredClone(serializedConfig));
      };

      function createListItem(
        layerNamesConfig: string,
        index: number,
      ): VcsListItemWithLabel {
        const label = localConfig.value.labels[index];
        const layer = app.layers.getByKey(layerNamesConfig)!;
        const fallbackLabel = layer.properties?.title
          ? app.vueI18n.t(layer.properties.title as string)
          : layer.name;
        return {
          name: layerNamesConfig,
          title: `${layerNamesConfig} - ${label ?? fallbackLabel}`,
          label,
          actions: [
            {
              name: 'edit',
              icon: '$vcsEdit',
              callback(): void {
                editLayerNamesAtIndex.value = index;
              },
            },
            {
              name: 'remove',
              icon: '$vcsTrashCan',
              callback(): void {
                localConfig.value.layerNames.splice(index, 1);
                localConfig.value.labels.splice(index, 1);
                listItems.value =
                  localConfig.value.layerNames.map(createListItem);
              },
            },
          ],
        };
      }

      function refreshListItems(): void {
        listItems.value = localConfig.value.layerNames.map(createListItem);
      }

      refreshListItems();

      return {
        itemName,
        itemTitle,
        itemHeight,
        itemWidth,
        itemHeaderTitle,
        itemHeaderIcon,
        itemActionTooltip,
        itemActionIcon,
        apply,
        localConfig,
        listItems,
        selectedLayers: computed(() =>
          localConfig.value.layerNames.filter(
            (layerName, index) =>
              index !== editLayerNamesAtIndex.value && !!layerName,
          ),
        ),
        headerActions: [
          {
            name: 'add',
            icon: '$vcsPlus',
            callback(): void {
              refreshListItems();
              isAddingLayerLabel.value = true;
              editLayerNamesAtIndex.value =
                localConfig.value.layerNames.push('') - 1;
            },
          },
        ],
        tickOptions: computed({
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
              refreshListItems();
              isAddingLayerLabel.value = false;
            } else {
              editLayerNamesAtIndex.value = undefined;
            }
          },
        }),
        closeLayerLabelsEdit(): void {
          const index = editLayerNamesAtIndex.value;
          if (
            isAddingLayerLabel.value &&
            index !== undefined &&
            localConfig.value?.layerNames
          ) {
            localConfig.value.layerNames.splice(index, 1);
            localConfig.value.labels.splice(index, 1);
            refreshListItems();
          }
          isAddingLayerLabel.value = false;
          editLayerNamesAtIndex.value = undefined;
        },
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
      };
    },
  });
</script>

<style scoped></style>
