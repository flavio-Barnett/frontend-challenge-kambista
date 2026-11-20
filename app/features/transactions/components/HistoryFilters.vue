<script setup lang="ts">
import { formatCalendarDay } from '~/shared/format/date-time';
import { useRangeCalendar } from '../composables/useRangeCalendar';
import {
  HISTORY_PRESETS,
  limaToday,
  matchingPreset,
  presetRange,
  type HistoryPreset,
  type HistoryRange,
} from '../domain/history-range';

const range = defineModel<HistoryRange>('range', { required: true });

const {
  open: calendarOpen,
  draft,
  maxDay,
  pick: pickDays,
} = useRangeCalendar(range);

const activePreset = computed(() => matchingPreset(range.value, limaToday()));

function pickPreset(preset: HistoryPreset): void {
  range.value = presetRange(preset, limaToday());
}
</script>

<template>
  <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div role="group" aria-label="Rangos rápidos" class="flex flex-wrap gap-2">
      <UButton
        v-for="preset in HISTORY_PRESETS"
        :key="preset.id"
        :label="preset.label"
        color="neutral"
        :variant="activePreset === preset.id ? 'solid' : 'outline'"
        :aria-pressed="activePreset === preset.id"
        size="sm"
        @click="pickPreset(preset.id)"
      />
    </div>

    <UPopover v-model:open="calendarOpen">
      <UButton
        color="neutral"
        variant="outline"
        trailing-icon="i-lucide-calendar"
        class="justify-between gap-4 sm:min-w-80"
      >
        <span class="flex gap-6 text-start">
          <span class="flex flex-col">
            <span class="text-xs text-muted">Desde</span>
            <span class="font-medium">{{
              formatCalendarDay(range.startDate)
            }}</span>
          </span>
          <span class="flex flex-col">
            <span class="text-xs text-muted">Hasta</span>
            <span class="font-medium">{{
              formatCalendarDay(range.endDate)
            }}</span>
          </span>
        </span>
      </UButton>

      <template #content>
        <UCalendar
          :model-value="draft"
          range
          :max-value="maxDay"
          class="p-2"
          @update:model-value="pickDays"
        />
      </template>
    </UPopover>
  </div>
</template>
