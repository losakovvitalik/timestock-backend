const SEED_COLORS = [
  '#E53935',
  '#D81B60',
  '#F06292',
  '#FF7043',
  '#FB8C00',
  '#FFB300',
  '#FDD835',
  '#7CB342',
  '#43A047',
  '#00897B',
  '#00ACC1',
  '#039BE5',
  '#1E88E5',
  '#3949AB',
  '#5E35B1',
  '#8E24AA',
  '#AB47BC',
  '#EC407A',
  '#26A69A',
  '#29B6F6',
];

export async function seedColors(): Promise<void> {
  const existingColors = await strapi.documents('api::color.color').findMany({
    limit: 1,
  });

  if (existingColors.length > 0) {
    strapi.log.warn('Цвета уже существуют, пропускаем...');
    return;
  }

  strapi.log.info('Создаем цвета...');

  for (const hex of SEED_COLORS) {
    await strapi.documents('api::color.color').create({
      data: { hex },
    });
  }

  strapi.log.info(`Создано ${SEED_COLORS.length} цветов`);
}
