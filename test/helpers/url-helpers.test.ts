import * as url_helpers from "../../src/helpers/url-helpers"

describe("url_helpers.isValidExternalURL", () => {
  test("0", () => {
    let result: any = url_helpers.isValidExternalURL({ toString: () => "2019-07-01" })
    expect(result).toMatchSnapshot()
  })

  test("1", () => {
    let result: any = url_helpers.isValidExternalURL({ toString: () => "2017-03-01" })
    expect(result).toMatchSnapshot()
  })

  test("2", () => {
    let result: any = url_helpers.isValidExternalURL({ toString: () => "2020-03-01" })
    expect(result).toMatchSnapshot()
  })

  test("3", () => {
    let result: any = url_helpers.isValidExternalURL({ toString: () => "2019-06-01" })
    expect(result).toMatchSnapshot()
  })

  test("4", () => {
    let result: any = url_helpers.isValidExternalURL({ toString: () => "2019-10-01-preview" })
    expect(result).toMatchSnapshot()
  })

  test("5", () => {
    let result: any = url_helpers.isValidExternalURL({ toString: () => "" })
    expect(result).toMatchSnapshot()
  })

  test("6", () => {
    let result: any = url_helpers.isValidExternalURL({ toString: () => "2020-06-01" })
    expect(result).toMatchSnapshot()
  })
})


describe("url_helpers.isValidFileUrl", () => {
  test("0", () => {
    let result: any = url_helpers.isValidFileUrl("/path/to/file")
    expect(result).toMatchSnapshot()
  })

  test("1", () => {
    let result: any = url_helpers.isValidFileUrl("path/to/folder/")
    expect(result).toMatchSnapshot()
  })

  test("2", () => {
    let result: any = url_helpers.isValidFileUrl("C:\\\\path\\to\\folder\\")
    expect(result).toMatchSnapshot()
  })

  test("3", () => {
    let result: any = url_helpers.isValidFileUrl("./path/to/file")
    expect(result).toMatchSnapshot()
  })

  test("4", () => {
    let result: any = url_helpers.isValidFileUrl("file")
    expect(result).toMatchSnapshot()
  })
})


describe("url_helpers.openPath", () => {
  test("0", async () => {
    await url_helpers.openPath("Anas")
  })
})


describe("url_helpers.openExternalUrl", () => {
  test("0", () => {
    let result: any = url_helpers.openExternalUrl("https://twitter.com/path?abc", false)
    expect(result).toMatchSnapshot()
  })

  test("1", () => {
    let result: any = url_helpers.openExternalUrl("http://www.example.com/route/123?foo=bar", true)
    expect(result).toMatchSnapshot()
  })

  test("2", () => {
    let result: any = url_helpers.openExternalUrl("www.google.com", false)
    expect(result).toMatchSnapshot()
  })

  test("3", () => {
    let result: any = url_helpers.openExternalUrl("ferdium.org", true)
    expect(result).toMatchSnapshot()
  })

  test("4", () => {
    let result: any = url_helpers.openExternalUrl("", true)
    expect(result).toMatchSnapshot()
  })
})
