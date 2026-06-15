
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Clock, Inbox, Loader2, MailCheck, RefreshCw } from 'lucide-react'
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
import { useResetLinkMutation } from '@/simadou/allHooks/auth/authHooks'
import { useState } from 'react'
import { useGeneralParamsQuery } from '@/simadou/allHooks/generalParams/queries'


const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Veuillez entrer votre email' : "Entrez une adresse email valide"),
  }),
})

export function ForgotPasswordForm({mode } : {mode : "reset" | "setup"}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  const [isSubmitted, setIsSubmitted] = useState(false)
const [submittedEmail, setSubmittedEmail] = useState('')
const { data : config} = useGeneralParamsQuery()
  

 

 
 const { mutate: resetPassword, isPending } = useResetLinkMutation()

function onSubmit(data: z.infer<typeof formSchema>) {
  resetPassword(
    { data, mode },
    {
      onSuccess: () => {
        setSubmittedEmail(data.email)
        setIsSubmitted(true)
      },
    }
  )
}

const handleResend = () => {
  resetPassword(
    { data: { email: submittedEmail }, mode },
    {
      onSuccess: () => {
        // stays on success screen, no flash
      },
    }
  )
}


  return (
    <>
 {
  isSubmitted ? (
      <div className={"flex flex-col items-center gap-5 text-center"}>

    <div className="flex size-13 items-center justify-center rounded-full
                    border border-emerald-200 bg-emerald-50
                    dark:border-emerald-800 dark:bg-emerald-950">
      <MailCheck className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
    </div>

    <div className="space-y-1.5">
      <p className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
        Consultez votre boîte mail
      </p>
      <p className="text-sm leading-relaxed text-zinc-500">
        Nous avons envoyé un lien à{' '}
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            {submittedEmail}   
          </span>
        </span>
        . S'il n'apparaît pas, vérifiez vos courriers indésirables.
      </p>
    </div>

    {/* Email meta card */}
    <div className="w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2.5 border-b border-zinc-200 px-3.5 py-2.5
                      dark:border-zinc-800">
        <Inbox className="size-3.5 shrink-0 text-zinc-400" aria-hidden />
       
        <span className="text-xs text-zinc-400">{config?.structureEmail ?? 'simandou@gmail.com'}</span>  
      </div>
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <Clock className="size-3.5 shrink-0 text-zinc-400" aria-hidden />
        <span className="text-xs text-zinc-400">
          Lien valable{' '}
          <span className="font-medium text-zinc-600 dark:text-zinc-300">24 heures</span>
        </span>
      </div>
    </div>

    {/* Resend */}
  
     <div className="w-full space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <p className="text-xs text-zinc-400">Vous n'avez rien reçu ?</p>
     <Button
      className="w-full text-sm"
      disabled={isPending}  
      onClick={handleResend}
    >
      {isPending
        ? <RefreshCw className="animate-spin" />
        : <RefreshCw className="size-3.5" />
      }
     {isPending ? "Renvoie du lien .." : "Renvoyer le lien" }
    </Button>
    </div>
  

  </div>
  ) 
  : (
       <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={'grid gap-2'}
      
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="mt-2" disabled={isPending}>
          Continuer
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <ArrowRight />
          )}
        </Button>
      </form>
    </Form>
  )
 }
 </>
  )
}