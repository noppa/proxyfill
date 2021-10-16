import rewire from "rewire"
const index = rewire("./index")
const getReflect = index.__get__("getReflect")
const getObject = index.__get__("getObject")
const noop = index.__get__("noop")
const reflectDefinePropertyPolyfill = index.__get__("reflectDefinePropertyPolyfill")
const objectDefinePropertyPolyfill = index.__get__("objectDefinePropertyPolyfill")
const objectDefinePropertiesPolyfill = index.__get__("objectDefinePropertiesPolyfill")
const getOwnPropertyDescriptorPolyfill = index.__get__("getOwnPropertyDescriptorPolyfill")
const isOwnEnumerableStringKey = index.__get__("isOwnEnumerableStringKey")
const isString = index.__get__("isString")
const isSymbol = index.__get__("isSymbol")
const objectKeysPolyfill = index.__get__("objectKeysPolyfill")
const getOwnPropertyNamesPolyfill = index.__get__("getOwnPropertyNamesPolyfill")
const getOwnPropertySymbolsPolyfill = index.__get__("getOwnPropertySymbolsPolyfill")
const hasOwnPropertyStatic = index.__get__("hasOwnPropertyStatic")
const assignPolyfill = index.__get__("assignPolyfill")
const logWarning = index.__get__("logWarning")
const setPropertyTrap = index.__get__("setPropertyTrap")
const getProxyfillApi = index.__get__("getProxyfillApi")
const isProxy = index.__get__("isProxy")
const assertNotRevoked = index.__get__("assertNotRevoked")
const normalizeProperty = index.__get__("normalizeProperty")
// @ponicode
describe("getReflect", () => {
    test("0", () => {
        let callFunction: any = () => {
            getReflect()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("getObject", () => {
    test("0", () => {
        let callFunction: any = () => {
            getObject()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("noop", () => {
    test("0", () => {
        let callFunction: any = () => {
            noop()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("reflectDefinePropertyPolyfill", () => {
    test("0", () => {
        let callFunction: any = () => {
            reflectDefinePropertyPolyfill({}, "Elio", { configurable: true, enumerable: false, value: 256, writable: true })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            reflectDefinePropertyPolyfill({}, "Elio", { configurable: true, enumerable: false, value: 10, writable: true })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            reflectDefinePropertyPolyfill({}, "Elio", { configurable: false, enumerable: false, value: 64, writable: true })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            reflectDefinePropertyPolyfill(null, "", { configurable: false, enumerable: true, value: Infinity, writable: true })
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("objectDefinePropertyPolyfill", () => {
    test("0", () => {
        let callFunction: any = () => {
            objectDefinePropertyPolyfill({}, "Elio", { configurable: false, enumerable: true, value: true, writable: true })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            objectDefinePropertyPolyfill({}, "Dillenberg", { configurable: true, enumerable: false, value: false, writable: false })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            objectDefinePropertyPolyfill({}, "Elio", { configurable: false, enumerable: false, value: true, writable: true })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            objectDefinePropertyPolyfill({}, "Dillenberg", { configurable: true, enumerable: true, value: false, writable: true })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction: any = () => {
            objectDefinePropertyPolyfill(null, "elio@example.com", { configurable: true, enumerable: false, value: true, writable: false })
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("objectDefinePropertiesPolyfill", () => {
    test("0", () => {
        let callFunction: any = () => {
            objectDefinePropertiesPolyfill({}, { key0: { configurable: false, enumerable: true, value: false, writable: true }, key1: { configurable: false, enumerable: false, value: false, writable: false }, key2: { configurable: false, enumerable: true, value: false, writable: true }, key3: { configurable: true, enumerable: true, value: false, writable: true } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            objectDefinePropertiesPolyfill({}, {})
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            objectDefinePropertiesPolyfill({}, { key0: { configurable: false, enumerable: true, value: 10, writable: false }, key1: { configurable: true, enumerable: false, value: "Dillenberg", writable: false }, key2: { configurable: true, enumerable: false, value: false, writable: false }, key3: { configurable: true, enumerable: false, value: "Dillenberg", writable: false } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            objectDefinePropertiesPolyfill({}, { key0: { configurable: false, enumerable: false, value: -Infinity, writable: true }, key1: { configurable: true, enumerable: true, value: "", writable: false }, key2: { configurable: true, enumerable: true, value: -Infinity, writable: false }, key3: { configurable: false, enumerable: true, value: true, writable: true }, key4: { configurable: false, enumerable: true, value: false, writable: true } })
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("getOwnPropertyDescriptorPolyfill", () => {
    test("0", () => {
        let callFunction: any = () => {
            getOwnPropertyDescriptorPolyfill({}, "prototype")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            getOwnPropertyDescriptorPolyfill({}, "Dillenberg")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            getOwnPropertyDescriptorPolyfill(null, "prototype")
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("isOwnEnumerableStringKey", () => {
    test("0", () => {
        let callFunction: any = () => {
            isOwnEnumerableStringKey("Dillenberg", {})
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            isOwnEnumerableStringKey("Elio", {})
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            isOwnEnumerableStringKey(null, null)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("isString", () => {
    test("0", () => {
        let callFunction: any = () => {
            isString([-1, 0.5, 1, 2, 3, 4, 5])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            isString("Elio")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            isString("elio@example.com")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            isString(["ponicodeIsAwesome", -0.353, "**Hamburger**", 4653])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction: any = () => {
            isString("Dillenberg")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction: any = () => {
            isString("")
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("isSymbol", () => {
    test("0", () => {
        let callFunction: any = () => {
            isSymbol("Elio")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            isSymbol("elio@example.com")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            isSymbol("Dillenberg")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            isSymbol("")
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("objectKeysPolyfill", () => {
    test("0", () => {
        let callFunction: any = () => {
            objectKeysPolyfill({})
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            objectKeysPolyfill(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("getOwnPropertyNamesPolyfill", () => {
    test("0", () => {
        let callFunction: any = () => {
            getOwnPropertyNamesPolyfill(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("getOwnPropertySymbolsPolyfill", () => {
    test("0", () => {
        let callFunction: any = () => {
            getOwnPropertySymbolsPolyfill({})
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            getOwnPropertySymbolsPolyfill(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("hasOwnPropertyStatic", () => {
    test("0", () => {
        let callFunction: any = () => {
            hasOwnPropertyStatic({}, "elio@example.com")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            hasOwnPropertyStatic({}, "Elio")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            hasOwnPropertyStatic({}, "Dillenberg")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            hasOwnPropertyStatic(undefined, "")
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("assignPolyfill", () => {
    test("0", () => {
        let callFunction: any = () => {
            assignPolyfill("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E", "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            assignPolyfill(0, "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            assignPolyfill("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E", false)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            assignPolyfill(-5.48, "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction: any = () => {
            assignPolyfill(100, "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction: any = () => {
            assignPolyfill(Infinity, Infinity)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("logWarning", () => {
    test("0", () => {
        let callFunction: any = () => {
            logWarning("TypeError exception should be raised")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            logWarning("The app does not exist")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            logWarning("Could not find an existing submission in location.  rubric is original.")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            logWarning("Wait time out reached, while waiting for results")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction: any = () => {
            logWarning("Uploaded file was not added to the resource. ")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction: any = () => {
            logWarning("")
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("setPropertyTrap", () => {
    test("0", () => {
        let callFunction: any = () => {
            setPropertyTrap(undefined, "", undefined, true)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("getProxyfillApi", () => {
    test("0", () => {
        let callFunction: any = () => {
            getProxyfillApi({})
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            getProxyfillApi(null)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("isProxy", () => {
    test("0", () => {
        let callFunction: any = () => {
            isProxy({})
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            isProxy(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("assertNotRevoked", () => {
    test("0", () => {
        let callFunction: any = () => {
            assertNotRevoked(undefined, "")
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("normalizeProperty", () => {
    test("0", () => {
        let callFunction: any = () => {
            normalizeProperty("Michael")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            normalizeProperty(56784)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            normalizeProperty("Anas")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            normalizeProperty("Pierre Edouard")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction: any = () => {
            normalizeProperty("Edmond")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction: any = () => {
            normalizeProperty(NaN)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("index.invoke", () => {
    test("0", () => {
        let callFunction: any = () => {
            index.invoke({}, "", [])
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("index.deleteProperty", () => {
    test("0", () => {
        let callFunction: any = () => {
            index.deleteProperty({}, "Dillenberg")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            index.deleteProperty({}, "elio@example.com")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            index.deleteProperty({}, "Elio")
        }
    
        expect(callFunction).not.toThrow()
    })
})
