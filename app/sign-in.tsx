import { ErrorMessage } from '@/components/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, router, Stack } from 'expo-router'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import { View, Image, Form, Input, Button, Separator, Text } from 'tamagui'
import { z } from 'zod'
import { signInWithEmailAndPassword } from '@firebase/auth'
import { auth } from '@/lib/auth'
import { Helmet } from 'react-helmet-async'

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
})

type FormData = z.infer<typeof schema>

export default function SignIn() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      router.replace('/')
    } catch (e) {
      setError('email', {
        type: 'manual',
        message: 'メールアドレスまたはパスワードが違います',
      })
    }
  }

  return (
    <>
      <Helmet>
        <title>ログイン</title>
      </Helmet>
      <Stack.Screen
        options={{
          title: 'ログイン',
        }}
      />
      <View flex={1} justifyContent='center' alignItems='center'>
        <Image
          source={require('../assets/images/logo.png')}
          width={140}
          height={140}
        />
        <Form gap={10} width={300}>
          <Controller
            control={control}
            render={({ field: { onChange, ...props } }) => (
              <Input
                placeholder='メールアドレス'
                keyboardType='email-address'
                onChangeText={onChange}
                {...props}
              />
            )}
            name='email'
          />
          <ErrorMessage errors={errors} name='email' />

          <Controller
            control={control}
            render={({ field: { onChange, ...props } }) => (
              <Input
                placeholder='パスワード'
                secureTextEntry
                onChangeText={onChange}
                {...props}
              />
            )}
            name='password'
          />
          <ErrorMessage errors={errors} name='password' />

          <Form.Trigger asChild>
            <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
              ログイン
            </Button>
          </Form.Trigger>

          <Separator />

          <Link href='/sign-up' replace>
            <Button variant='outlined' fullscreen>
              新規登録
            </Button>
          </Link>
        </Form>
      </View>
    </>
  )
}
