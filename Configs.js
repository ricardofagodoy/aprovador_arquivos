class Configs {

  constructor() {
    this.range = spreadsheet.getRangeByName(NAMED_RANGES.configs)

    this.values = this.range.getValues()
    this.header = this.values.shift()
  }

  field(name) {
    return this.header.indexOf(name)
  }

  iterateConfigs() {
    return this.values.filter(v => v[0])
  }

  findConfig(name) {
    return this.values.find(v => v[0] == name)
  }

  saveConfigs() {
    this.range.setValues([this.header, ...this.values])
  }
}
