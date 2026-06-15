import {z} from 'zod'

export const roleEnum = z.enum([
 
  "ADMIN",
  "PME"

])


export const PasswordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .refine((pw) => /[a-z]/.test(pw), {
    message: "Au moins une lettre minuscule requise",
  })
  .refine((pw) => /[A-Z]/.test(pw), {
    message: "Au moins une lettre majuscule requise",
  })
  .refine((pw) => /\d/.test(pw), {
    message: "Au moins un chiffre requis",
  })
  .refine((pw) => /[^A-Za-z0-9]/.test(pw), {
    message: "Au moins un caractère spécial requis",
  })



// Login

export const LoginSchema = z.object({
  personal_id : z
  .string()
  .min(3 , "Identifiant trop court"),

  password : z
  .string()
  .min(6,"Mot de passe trop court")
})

export type LoginInput = z.infer<typeof LoginSchema>


// Password Reset
export const ResetPasswordFormSchema = z
  .object({
    newPassword: PasswordSchema,
    confirm: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirm"],
        message: "Les mots de passe ne correspondent pas",
      })
    }
  })

  export type ResetPasswordInput = z.infer<typeof ResetPasswordFormSchema>



  // Schéma de validation pour le changement de mot de passe
export const changePasswordSchema = z.object({
  // Mot de passe actuel - requis
  oldPassword: z
    .string()
    .min(8, 'Mot de passe trop court'),

  // Nouveau mot de passe - requis avec validation de force
  newPassword: PasswordSchema,
   

  // Confirmation du nouveau mot de passe - doit correspondre
  confirmNewPassword: z
    .string()
    .min(1, 'Confirmation du mot de passe requise'),
}).superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmNewPassword"],
        message: "Les mots de passe ne correspondent pas",
      })
    }

    if(data.oldPassword === data.newPassword){
      ctx.addIssue({
        code :z.ZodIssueCode.custom,
        path : ["newPassword"],
        message : "L'ancien et le nouveau mot de passe ne peuvent pas être identiques"
      })
    }
  })
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
