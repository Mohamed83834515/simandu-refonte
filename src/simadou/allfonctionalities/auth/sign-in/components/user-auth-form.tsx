
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link} from '@tanstack/react-router'
import { Loader2, LogIn, TriangleAlert } from 'lucide-react'
import {cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/others/password-input'
import { useLogin } from '@/simadou/allHooks/auth/authHooks'
import { LoginInput, LoginSchema } from '@/simadou/schemas/auth.schemas'



interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const {mutate : login, isPending, isError, error} = useLogin()


 

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      personal_id: '',
      password: '',
    },
  })

  function onSubmit(data: LoginInput) {
    login({id_personnel_perso : data.personal_id , password : data.password})

   }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='personal_id'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifiant</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                  search={{ mode: 'forgot' }} 
                className='absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Mot de passe oublié?
              </Link>
            </FormItem>
          )}

          
        />
        {isError && (
          <div className='flex items-center gap-2 text-red-600 font-medium justify-center text-xs'>
            <TriangleAlert className='w-4 h-4' />
            {error.message}
          </div>
        )}
        <Button className='mt-2' disabled={isPending}>
          {isPending ? <Loader2 className='animate-spin' /> : <LogIn />}
          {isPending ? "Connexion .." : "Se connecter"}
        </Button>
      </form>
    </Form>
  )
}
