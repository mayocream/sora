import { Link, router, Stack } from 'expo-router'
import { View, Image, Form, Input, Button, Separator } from 'tamagui'
import { z } from 'zod'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ErrorMessage } from '@/components/input'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from '@firebase/auth'
import { auth } from '@/lib/auth'
import { collection, doc, runTransaction } from 'firebase/firestore'
import { db } from '@/lib/db'
import { Helmet } from 'react-helmet-async'

const schema = z
  .object({
    email: z.string().email('メールアドレスの形式が正しくありません'),
    password: z
      .string()
      .min(8, '8文字以上で入力してください')
      .max(255, '255文字以内で入力してください'),
    passwordConfirmation: z.string().min(8).max(255),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'パスワードが一致しません',
  })

type FormData = z.infer<typeof schema>

export default function SignUp() {
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
      passwordConfirmation: '',
    },
  })
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      )

      // create user in our application
      await runTransaction(db, async (transaction) => {
        transaction.set(
          doc(collection(db, 'usernames'), userCredential.user.uid),
          {
            uid: userCredential.user.uid,
          }
        )
        transaction.set(doc(collection(db, 'users'), userCredential.user.uid), {
          name: userCredential.user.uid,
          username: userCredential.user.uid,
          bio: '',
        })
      })

      // send email verification
      await sendEmailVerification(userCredential.user)

      // redirect to home
      router.replace('/')
    } catch (e) {
      setError('email', {
        type: 'manual',
        message: 'メールアドレスが既に登録されています',
      })
    }
  }

  return (
    <>
      <Helmet>
        <title>新規登録</title>
      </Helmet>
      <Stack.Screen
        options={{
          title: '新規登録',
        }}
      />
      <View flex={1} justifyContent='center' alignItems='center' gap='$10'>
        <Image
          source={require('../assets/images/logo.png')}
          width={140}
          height={120}
        />
        <Form gap={10} width={300}>
          <Controller
            control={control}
            render={({ field: { onChange, ...props } }) => (
              <Input
                onChangeText={onChange}
                placeholder='メールアドレス'
                keyboardType='email-address'
                {...props}
              />
            )}
            name='email'
          />
          <ErrorMessage name='email' errors={errors} />

          <Controller
            control={control}
            render={({ field: { onChange, ...props } }) => (
              <Input
                onChangeText={onChange}
                placeholder='パスワード'
                secureTextEntry
                {...props}
              />
            )}
            name='password'
          />
          <ErrorMessage name='password' errors={errors} />

          <Controller
            control={control}
            render={({ field: { onChange, ...props } }) => (
              <Input
                onChangeText={onChange}
                placeholder='パスワードの確認'
                secureTextEntry
                {...props}
              />
            )}
            name='passwordConfirmation'
          />
          <ErrorMessage name='passwordConfirmation' errors={errors} />

          <Form.Trigger asChild>
            <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
              新規登録
            </Button>
          </Form.Trigger>

          <Separator marginVertical='$2' />

          <Link href='/sign-in' replace>
            <Button variant='outlined' fullscreen>
              ログイン
            </Button>
          </Link>
        </Form>
      </View>
    </>
  )
}
