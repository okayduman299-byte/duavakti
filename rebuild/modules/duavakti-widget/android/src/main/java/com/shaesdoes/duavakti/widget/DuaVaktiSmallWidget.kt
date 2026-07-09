package com.shaesdoes.duavakti.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews

class DuaVaktiSmallWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    updateWidgets(context, manager, ids) { data ->
      RemoteViews(context.packageName, R.layout.duavakti_widget_small).apply {
        setTextViewText(R.id.next_prayer, data.nextPrayer)
        setTextViewText(R.id.next_time, data.nextTime)
        setTextViewText(R.id.location, data.location)
      }
    }
  }
}
