export default () => async (ctx: any, next: () => Promise<void>) => {
  const h = ctx.request.header;

  console.log(
    {
      tag: 'HTTPS-DEBUG',
      secure: ctx.request.secure,
      protocol: (ctx.request as any).protocol,
      socketEncrypted: Boolean((ctx.req.socket as any)?.encrypted),
      xfp: h['x-forwarded-proto'],
      host: h['host'],
      xfh: h['x-forwarded-host'],
      xfpPort: h['x-forwarded-port'],
    },
    'HTTPS probe'
  );

  await next();
};
