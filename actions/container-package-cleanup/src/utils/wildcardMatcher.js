class WildcardMatcher {
  constructor() {
    this.name = "WildcardMatcher";
  }

  match(tag, pattern) {
    const t = tag.toLowerCase();
    const p = pattern.toLowerCase();

    // Экранируем всё, кроме *
    const escaped = p
      .replace(/[-[\]{}()+?.\\^$|]/g, "\\$&")
      .replace(/\*/g, ".*");

    const regex = new RegExp(`^${escaped}$`, "i");
    return regex.test(t);
  }
}

module.exports = WildcardMatcher;
