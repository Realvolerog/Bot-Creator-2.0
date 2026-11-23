/**
 * Сервис отправки сигналов о достижении целей в Яндекс.Метрику 
 * родительского окна платформы account.pro-talk.ru через postMessage.
 */

export function sendMetrikaGoal(target: string = 'app_action_completed'): void {
  if (typeof window === 'undefined') return;

  try {
    if (window.parent && window.parent !== window) {
      const message = {
        type: 'METRIKA_GOAL',
        target: target
      };

      // Отправка сигнала в родительское окно платформы
      window.parent.postMessage(message, 'https://account.pro-talk.ru');
      console.log(`[Metrika] ✅ Отправлен сигнал цели в родительское окно:`, message);
    }
  } catch (error) {
    console.warn('[Metrika] Ошибка при отправке postMessage в родительское окно:', error);
  }
}
