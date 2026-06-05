import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { useResetPasswordMutation } from '@/simadou/allHooks/auth/authHooks'
import { ResetPasswordCredentials } from '@/simadou/allSercices/authService'

export const resetPasswordSchema = z
  .object({
    new_password: z.string().min(6, {
      message: 'Le mot de passe doit contenir au moins 6 caractères',
    }),
    confirm_new_password: z.string().min(6, {
      message: 'Le mot de passe doit contenir au moins 6 caractères',
    }),
    uid: z.string(),
    token: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_new_password'], // L'erreur s'affichera sur le champ confirm_new_password
  })

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const route = getRouteApi('/(auth)/set-password/$uid/$token')
  const { uid, token } = route.useParams()

  const form = useForm<ResetPasswordCredentials>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: '',
      confirm_new_password: '',
      uid: uid || '',
      token: token || '',
    },
  })

  const { mutate: resetPassword, isPending } = useResetPasswordMutation()

  const onSubmit = async (data: ResetPasswordCredentials) => {
    setIsLoading(true)

    resetPassword(
      { data },
      {
        onSuccess: () => {
          toast.success('Mot de passe réinitialisé avec succès', {
            description: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe',
          })
          navigate({ to: '/sign-in' })
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe'

          toast.error('Erreur', {
            description: errorMessage,
          })

          // Gestion des erreurs spécifiques
          if (errorMessage.includes('invalide') || errorMessage.includes('expiré')) {
            form.setError('root', {
              message: 'Le lien de réinitialisation est invalide ou a expiré',
            })
          }
        },
        onSettled: () => {
          setIsLoading(false)
        },
      }
    )
  }

  // Vérifier si uid et token sont présents
  if (!uid || !token) {
    return (
      <div className='flex flex-col items-center justify-center p-8 text-center'>
        <h2 className='mb-2 text-xl font-semibold'>Lien invalide</h2>
        <p className='mb-4 text-muted-foreground'>
          Le lien de réinitialisation est invalide ou a expiré.
        </p>
        <Button onClick={() => navigate({ to: '/sign-in' })}>
          Retour à la connexion
        </Button>
      </div>
    )
  }

  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
        {/* Affichage des erreurs globales (root) */}
        {form.formState.errors.root && (
          <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name='new_password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nouveau mot de passe</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Entrez votre nouveau mot de passe'
                    className='pr-10'
                    {...field}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4 text-muted-foreground' />
                    ) : (
                      <Eye className='h-4 w-4 text-muted-foreground' />
                    )}
                    <span className='sr-only'>
                      {showPassword ? 'Masquer' : 'Afficher'} le mot de passe
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirm_new_password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='Confirmez votre nouveau mot de passe'
                    className='pr-10'
                    {...field}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4 text-muted-foreground' />
                    ) : (
                      <Eye className='h-4 w-4 text-muted-foreground' />
                    )}
                    <span className='sr-only'>
                      {showConfirmPassword ? 'Masquer' : 'Afficher'} le mot de passe
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-2 pt-2'>
          <Button
            type='submit'
            className='w-full'
            disabled={isLoading || isPending}
          >
            {(isLoading || isPending) ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Réinitialisation en cours...
              </>
            ) : (
              <>
                Réinitialiser le mot de passe
                <ArrowRight className='ml-2 h-4 w-4' />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
