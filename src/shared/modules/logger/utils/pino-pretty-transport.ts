import PinoPretty from 'pino-pretty';

export default (): PinoPretty.PrettyStream =>
  PinoPretty({
    colorize: !process.env.NO_COLOR,
    levelFirst: true,
    translateTime: 'yyyy-mm-dd HH:MM:ss o',
    customPrettifiers: {
      hostname: (hostname, _key, _level, { colors }) =>
        colors.blue(stringOrObjToString(hostname)),
      pid: (pid, _key, _level, { colors }) => colors.blue(stringOrObjToString(pid)),
      name: (name, _key, _level, { colors }) => colors.blue(stringOrObjToString(name)),
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

function stringOrObjToString(strOrObj: string | object): string {
  if (typeof strOrObj === 'object') {
    return JSON.stringify(strOrObj);
  }

  return strOrObj;
}
