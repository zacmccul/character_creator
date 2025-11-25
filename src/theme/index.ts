import { createSystem, defaultConfig } from "@chakra-ui/react"

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#f0e7ff" },
          100: { value: "#d9c7ff" },
          200: { value: "#b894ff" },
          300: { value: "#9761ff" },
          400: { value: "#7c3aed" },
          500: { value: "#6d28d9" },
          600: { value: "#5b21b6" },
          700: { value: "#4c1d95" },
          800: { value: "#3d1775" },
          900: { value: "#2e1065" },
        },
      },
    },
  },
})
