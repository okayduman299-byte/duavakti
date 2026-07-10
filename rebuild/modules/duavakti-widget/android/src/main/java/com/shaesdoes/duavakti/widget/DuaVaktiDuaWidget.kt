package com.shaesdoes.duavakti.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews

class DuaVaktiDuaWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    updateWidgets(context, manager, ids) { data ->
      RemoteViews(context.packageName, R.layout.duavakti_widget_dua).apply {
        setTextViewText(R.id.dua_title, data.hourlyDua.title)
        setTextViewText(R.id.dua_meaning, data.hourlyDua.meaning)
        setTextViewText(R.id.dua_source, data.hourlyDua.source)
      }
    }
  }
}
