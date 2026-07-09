package com.shaesdoes.duavakti.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONArray
import org.json.JSONObject

class DuaVaktiWidgetModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DuaVaktiWidget")

    AsyncFunction("update") { payload: Map<String, Any?> ->
      val context = appContext.reactContext ?: throw IllegalStateException("Android context unavailable")
      persistPayload(context, payload)
      updateAllWidgets(context)
      true
    }
  }

  private fun persistPayload(context: Context, payload: Map<String, Any?>) {
    val prayers = JSONArray()
    val rawPrayers = payload["prayers"] as? List<*> ?: emptyList<Any?>()
    rawPrayers.forEach { item ->
      val row = item as? Map<*, *> ?: return@forEach
      prayers.put(JSONObject().apply {
        put("label", row["label"]?.toString() ?: "")
        put("time", row["time"]?.toString() ?: "--:--")
      })
    }

    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
      .putString("location", payload["location"]?.toString() ?: "Konum")
      .putString("nextPrayer", payload["nextPrayer"]?.toString() ?: "—")
      .putString("nextTime", payload["nextTime"]?.toString() ?: "--:--")
      .putString("remaining", payload["remaining"]?.toString() ?: "--:--:--")
      .putLong("targetEpoch", (payload["targetEpoch"] as? Number)?.toLong() ?: 0L)
      .putString("prayers", prayers.toString())
      .apply()
  }

  private fun updateAllWidgets(context: Context) {
    val manager = AppWidgetManager.getInstance(context)
    listOf(
      DuaVaktiSmallWidget::class.java,
      DuaVaktiMediumWidget::class.java,
      DuaVaktiLargeWidget::class.java,
    ).forEach { widgetClass ->
      val ids = manager.getAppWidgetIds(ComponentName(context, widgetClass))
      when (widgetClass) {
        DuaVaktiSmallWidget::class.java -> DuaVaktiSmallWidget().onUpdate(context, manager, ids)
        DuaVaktiMediumWidget::class.java -> DuaVaktiMediumWidget().onUpdate(context, manager, ids)
        DuaVaktiLargeWidget::class.java -> DuaVaktiLargeWidget().onUpdate(context, manager, ids)
      }
    }
  }

  companion object {
    const val PREFS = "duavakti_widget_prefs"
  }
}
