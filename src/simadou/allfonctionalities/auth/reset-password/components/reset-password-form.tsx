
import { getRouteApi, useNavigate } from '@tanstack/react-router'


import { Button } from '@/components/ui/button'

import { useResetPasswordMutation } from '@/simadou/allHooks/auth/authHooks'
import { ResetPasswordFormSchema, ResetPasswordInput } from '@/simadou/schemas/auth.schemas'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getSetPasswordFormConfig } from '@/simadou/allfieldsConfig/setPasswordForm'
import { SET_PASSWORD } from '@/simadou/allResetFields/resetField'

export function ResetPasswordForm() {



  const navigate = useNavigate()

  const route = getRouteApi('/(auth)/set-password/$uid/$token')
  const { uid, token } = route.useParams()



  const { mutate: resetPassword, isPending } = useResetPasswordMutation()

 
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

  const formConfig = getSetPasswordFormConfig()
   const handleSubmit = (data : ResetPasswordInput) =>{
     resetPassword({data : {new_password : data.newPassword , confirm_new_password : data.confirm , uid, token}})
      navigate({ to: '/sign-in' })
   }

  return (

   
    <>
      <DynamicForm
          config={formConfig}
          schema={ResetPasswordFormSchema}
          defaultValues={SET_PASSWORD}
          onSubmit={handleSubmit}
          isLoading={isPending}
          submitText="Continuer"
          loadingText="Enregistrement ..."
          className='bg-muted/50'
        />
    </>
  )
}
