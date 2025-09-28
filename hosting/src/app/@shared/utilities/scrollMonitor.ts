
// Types
import { scrollSettings } from '@shared/types/scroll-settings';

// Utilities
import { $$ } from './essential';
import { Utilities } from './utilities';

export class ScrollMonitor {

  private static target: string;
  private static handler: ((_: any)=>void);

  public static start(settings: scrollSettings) {

    // Realiza um reset antes de inicializar
    ScrollMonitor.reset();    

    // Configura inicialização do monitoramento
    ScrollMonitor.target = settings.target;

    ScrollMonitor.handler = (event) => {

      const scrollTop = event.target.scrollTop;
      const scrollHeight = (event.target.scrollHeight - event.target.offsetHeight);
      
      const checkBottom = (() => {
        return (((scrollHeight - <number>scrollTop) >= 0) ? (Math.ceil(<number>scrollTop) == Math.ceil(scrollHeight)) :
          (Math.floor(<number>scrollTop) == Math.ceil(scrollHeight)));
      })();

      if (settings.current) {
        settings.current({ scrollTop, scrollHeight });
      }

      if (settings.top && (scrollTop == 0)) {
        settings.top();
      }

      if (settings.bottom && checkBottom) {
        settings.bottom();
      }
    };

    $$(ScrollMonitor.target).on('scroll', ScrollMonitor.handler); 
  }

  public static reset() {

    Utilities.loading(false);

    if (ScrollMonitor.handler) {

      $$(ScrollMonitor.target).off('scroll', ScrollMonitor.handler);
      $$(ScrollMonitor.target)[0].scrollTop = 0;

      ScrollMonitor.handler = null;
      ScrollMonitor.target = null;
    }
  }

}
