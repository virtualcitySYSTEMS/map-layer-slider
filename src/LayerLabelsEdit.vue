<template>
  <v-card>
    <VcsFormSection>
      <v-form ref="form">
        <v-container class="px-2 pt-0 pb-2">
          <v-row no-gutters>
            <v-col cols="6">
              <VcsLabel html-for="layerName">
                {{ $t('layerSlider.configEditor.layerName') }}
              </VcsLabel>
            </v-col>
            <v-col cols="6">
              <VcsSelect
                id="layerName"
                :items="layerLocal"
                placeholder="layer"
                v-model="localLayerLabelsOptions.layerName"
                @change="validateForm"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="6">
              <VcsLabel html-for="labelName">
                {{ $t('layerSlider.configEditor.labelName') }}
              </VcsLabel>
            </v-col>
            <v-col cols="6">
              <VcsTextField
                id="labelName"
                placeholder="label"
                v-model="localLayerLabelsOptions.label"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <v-divider />
      <div class="d-flex pa-2">
        <VcsFormButton @click="$emit('close')">
          {{ $t('components.close') }}
        </VcsFormButton>
        <VcsFormButton
          class="justify-end relativePosition"
          :disabled="!isFormValid"
          @click="
            () => {
              $emit('input', localLayerLabelsOptions);
              $emit('close');
            }
          "
          variant="filled"
        >
          {{ $t('components.apply') }}
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
  import { VCard, VDivider, VContainer, VForm, VCol, VRow } from 'vuetify/lib';
  import { defineComponent, inject, ref, watch } from 'vue';
  import { moduleIdSymbol, volatileModuleId } from '@vcmap/core';

  export default defineComponent({
    name: 'LayerLabelsEdit',
    title: 'Layer - Labels Editor',
    components: {
      VcsSelect,
      VcsTextField,
      VcsLabel,
      VCol,
      VRow,
      VForm,
      VContainer,
      VcsFormButton,
      VDivider,
      VCard,
      VcsFormSection,
    },
    props: {
      value: {
        type: Object,
        required: true,
      },
    },
    setup(props) {
      const app = inject('vcsApp') as VcsUiApp;
      const localLayerLabelsOptions = ref(structuredClone(props.value));
      const isFormValid = ref(false);

      const layerLocal = ref(
        [...app.layers]
          .filter((layer) => layer[moduleIdSymbol] !== volatileModuleId)
          .map((layer) => layer.name),
      );

      const validateForm = (): void => {
        isFormValid.value = !!localLayerLabelsOptions.value.layerName;
      };

      watch(localLayerLabelsOptions, validateForm, { deep: true });

      return {
        localLayerLabelsOptions,
        layerLocal,
        isFormValid,
        validateForm,
      };
    },
  });
</script>

<style>
  .relativePosition {
    margin-left: 7em;
  }
</style>
