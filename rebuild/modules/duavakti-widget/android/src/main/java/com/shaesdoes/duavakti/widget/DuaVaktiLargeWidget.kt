package com.shaesdoes.duavakti.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews

class DuaVaktiLargeWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    updateWidgets(context, manager, ids) { data ->
      RemoteViews(context.packageName, R.layout.duavakti_widget_large).apply {
        setTextViewText(R.id.next_prayer, data.nextPrayer)
        setTextViewText(R.id.next_time, data.nextTime)
        setTextViewText(R.id.location, data.location)
        val labels = intArrayOf(R.id.prayer_label_1, R.id.prayer_label_2, R.id.prayer_label_3, R.id.prayer_label_4, R.id.prayer_label_5)
        val times = intArrayOf(R.id.prayer_time_1, R.id.prayer_time_2, R.id.prayer_time_3, R.id.prayer_time_4, R.id.prayer_time_5)
        for (index in 0 until 5) {
          val row = data.prayers.getOrNull(index) ?: ("—" to "--:--")
          setTextViewText(labels[index], row.first)
          setTextViewText(times[index], row.second)
        }
      }
    }
  }
}
