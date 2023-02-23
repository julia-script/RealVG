import { lerp } from "./lerp"

describe('lerp', () => {
    it('should interpolate between two numbers correctly', () => {
        expect(lerp(0, 10, 0.5)).toBe(5)
        expect(lerp(0, 10, 0)).toBe(0) 
        expect(lerp(0, 10, 1)).toBe(10)

        expect(lerp(10, 20, 0.5)).toBe(15)
    })
})