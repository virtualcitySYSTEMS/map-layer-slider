<template>
  <v-card>
    <VcsFormSection
      :heading="$st('layerSlider.config.tickEditor.heading')"
      :help-text="$st('layerSlider.config.tickEditor.help')"
      start-help-open
    >
      <v-container class="px-2 pt-0 pb-2">
        <v-row no-gutters>
          <v-col>
            <VcsLabel html-for="layer" required>
              {{ $st('layerSlider.config.tickEditor.layer') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsSelect
              id="layer"
              :items="availableLayers"
              v-model="localTickOptions.layerName"
              @change="validateForm"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel html-for="labelName">
              {{ $st('layerSlider.config.tickEditor.label') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="labelName"
              v-model="localTickOptions.label"
              :placeholder="placeholder"
              @input="validateForm"
            />
          </v-col>
        </v-row>
      </v-container>
      <v-divider />
      <div class="d-flex justify-end pa-2 gc-2">
        <VcsFormButton
          :disabled="!isFormValid"
          variant="filled"
          @click="
            () => {
              $emit('update:modelValue', {
                ...localTickOptions,
                label: localTickOptions.label || undefined,
              });
              $emit('close');
            }
          "
        >
          {{ $st('components.apply') }}
        </VcsFormButton>
        <VcsFormButton @click="$emit('close')">
          {{ $st('components.cancel') }}
        </VcsFormButton>
      </div>
    </VcsFormSection>
  </v-card>
</template>

<script lang="ts">
  import {
    VcsFormButton,
    VcsFormSection,
    VcsLabel,
    VcsTextField,
    VcsSelect,
    VcsUiApp,
  } from '@vcmap/ui';
  import { VCard, VDivider, VContainer, VCol, VRow } from 'vuetify/components';
  import {
    computed,
    defineComponent,
    inject,
    PropType,
    reactive,
    ref,
    watch,
  } from 'vue';
  import { moduleIdSymbol, volatileModuleId } from '@vcmap/core';

  type TickOptions = {
    layerName: string;
    label: string | undefined;
  };

  export default defineComponent({
    name: 'TickEditor',
    components: {
      VcsSelect,
      VcsTextField,
      VcsLabel,
      VCol,
      VRow,
      VContainer,
      VcsFormButton,
      VDivider,
      VCard,
      VcsFormSection,
    },
    props: {
      modelValue: {
        type: Object as PropType<TickOptions>,
        required: true,
      },
      selectedLayers: {
        type: Array as PropType<string[]>,
        default: () => [],
      },
    },
    setup(props) {
      const app = inject('vcsApp') as VcsUiApp;
      const localTickOptions = reactive(structuredClone(props.modelValue));
      const placeholder = ref('');
      const isFormValid = ref(!!localTickOptions.layerName);

      const layers = ref(
        [...app.layers]
          .filter((layer) => layer[moduleIdSymbol] !== volatileModuleId)
          .map((layer) => ({
            title: app.vueI18n.t(
              (layer.properties.title as string) ?? layer.name,
            ),
            value: layer.name,
          })),
      );
      const availableLayers = computed(() =>
        layers.value.filter(
          (layer) => !props.selectedLayers.includes(layer.value),
        ),
      );

      const validateForm = (): void => {
        isFormValid.value = !!localTickOptions.layerName;
      };
      const setPlaceholder = (): void => {
        if (localTickOptions.layerName) {
          placeholder.value = layers.value.find(
            ({ value }) => value === localTickOptions.layerName,
          )!.title;
        }
      };

      watch(localTickOptions, validateForm);
      watch(() => localTickOptions.layerName, setPlaceholder);

      if (availableLayers.value.length === 1 && !localTickOptions.layerName) {
        localTickOptions.layerName = availableLayers.value[0].value;
      }
      setPlaceholder();

      return {
        localTickOptions,
        availableLayers,
        placeholder,
        isFormValid,
        validateForm,
      };
    },
  });
</script>

<style scoped lang="scss"></style>
