class WildcardMatcher {
  constructor() {
    this.name = 'WildcardMatcher';
  }

  match(tag, pattern) {
    const t = tag.toLowerCase();
    const p = pattern.toLowerCase();

    // специальный кейс для '?*' — только буквы+цифры и хотя бы одна цифра
    if (p === '?*') {
      // /^[a-z0-9]+$/ соответствует только алфа‑цифре
      // /\d/ проверяет, что есть хотя бы одна цифра
      return /^[a-z0-9]+$/.test(t) && /\d/.test(t);
    }

    // нет ни звёздочки, ни вопроса — строгое сравнение
    if (!p.includes('*') && !p.includes('?')) {
      return t === p;
    }

    // чистый префикс: xxx*
    if (p.endsWith('*') && !p.startsWith('*') && !p.includes('?')) {
      return t.startsWith(p.slice(0, -1));
    }

    // чистый суффикс: *xxx
    if (p.startsWith('*') && !p.endsWith('*') && !p.includes('?')) {
      return t.endsWith(p.slice(1));
    }

    // contains: *xxx*
    if (p.startsWith('*') && p.endsWith('*') && !p.includes('?')) {
      return t.includes(p.slice(1, -1));
    }

    // общий вариант: билдим RegExp, эскейпим спецсимволы, затем *→.* и ?→.
    const escaped = p
      // эскейпим всё, кроме * и ?
      .replace(/[-[\]{}()+\\^$|#\s.]/g, '\\$&')
      // превращаем джокеры в RegExp
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    const re = new RegExp(`^${escaped}$`, 'i');
    return re.test(t);
  }
}

module.exports = WildcardMatcher;
