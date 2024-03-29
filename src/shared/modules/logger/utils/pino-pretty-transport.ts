import PinoPretty from 'pino-pretty';

import {
  blueConsole,
  cyanConsole,
} from '@shared/modules/logger/utils/console-color.util';

// eslint-disable-next-line max-lines-per-function
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
    messageFormat: (
      log: Record<string, any>,
      messageKey: string,
      _levelLabel,
      { colors },
    ) => {
      // eslint-disable-next-line security/detect-object-injection
      const message = log[messageKey] as string;

      if (log.res) {
        const logContext = log.context ? colors.yellow(`[${log.context}]`) : '';
        const reqMethod = log.req.method;
        const statusCode = log.res?.statusCode;
        const reqUrl = colors.yellow(log.req.url);
        const responseTime = colors.magentaBright(log.responseTime);

        const methodAndStatus = colors.magentaBright(`${reqMethod} ${statusCode}`);

        return `${logContext} ${methodAndStatus} ${reqUrl} - ${message} by ${responseTime} ms`;
      }

      if (log.context) {
        return `|${colors.yellow(log.context)}| ${message}`;
      }

      return `${message}`;
    },
  });
