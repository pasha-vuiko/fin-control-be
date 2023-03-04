import {
  blueConsole,
  cyanConsole,
  magentaBrightConsole,
  yellowConsole,
} from '@shared/modules/logger/utils/console-color.util';
import PinoPretty from 'pino-pretty';

export default (): PinoPretty.PrettyStream =>
  PinoPretty({
    colorize: !process.env.NO_COLOR,
    levelFirst: true,
    translateTime: 'yyyy-mm-dd HH:MM:ss o',
    customPrettifiers: {
      hostname: (hostname: string | object) => blueConsole(hostname),
      pid: (pid: string | object) => blueConsole(pid),
      name: (name: string | object) => blueConsole(name),
      caller: (caller: string | object) => cyanConsole(caller),
    },
    messageFormat: (log: Record<string, any>, messageKey: string) => {
      const message = log[messageKey] as string;

      if (log.res) {
        const logContext = log.context ? yellowConsole(`[${log.context}]`) : '';
        const reqMethod = log.req.method;
        const statusCode = log.res?.statusCode;
        const reqUrl = yellowConsole(log.req.url);
        const responseTime = magentaBrightConsole(log.responseTime);

        const methodAndStatus = magentaBrightConsole(`${reqMethod} ${statusCode}`);

        return `${logContext} ${methodAndStatus} ${reqUrl} - ${message} by ${responseTime} ms`;
      }

      return `|${yellowConsole(log.context)}| ${message}`;
    },
  });
