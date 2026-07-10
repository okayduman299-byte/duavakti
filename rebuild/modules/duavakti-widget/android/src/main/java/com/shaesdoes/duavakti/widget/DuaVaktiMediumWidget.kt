package com.shaesdoes.duavakti.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews

class DuaVaktiMediumWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    updateWidgets(context, manager, ids) { data ->
      RemoteViews(context.packageName, R.layout.duavakti_widget_medium).apply {
        setTextViewText(R.id.next_prayer, data.nextPrayer)
        setTextViewText(R.id.next_time, data.nextTime)
        setTextViewText(R.id.remaining, data.remaining)
        setTextViewText(R.id.location, data.location)
        setTextViewText(R.id.dua_title, "SAATİN DUASI · ${data.hourlyDua.title}")
        setTextViewText(R.id.dua_meaning, data.hourlyDua.meaning)
      }
    }
  }
}
