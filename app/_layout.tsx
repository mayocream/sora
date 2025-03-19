import { createTamagui, TamaguiProvider, Theme } from 'tamagui'
import { defaultConfig } from '@tamagui/config/v4'
import { Stack } from 'expo-router'
import { AuthProvider, useAuthContext } from '@/lib/context'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
})

const config = createTamagui({
  ...defaultConfig,
  fonts: {
    ...defaultConfig.fonts,
    heading: {
      ...defaultConfig.fonts.heading,
      family: `NotoSansJP, ${defaultConfig.fonts.heading.family}`,
    },
    body: {
      ...defaultConfig.fonts.body,
      family: `NotoSansJP, ${defaultConfig.fonts.body.family}`,
    },
  },
})

const AppContent = () => {
  const { loading } = useAuthContext()
  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync()
    }
  }, [loading])

  if (loading) {
    return null
  }

  return (
    <Stack>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <TamaguiProvider config={config}>
          <Theme name='light'>
            <AppContent />
          </Theme>
        </TamaguiProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}
