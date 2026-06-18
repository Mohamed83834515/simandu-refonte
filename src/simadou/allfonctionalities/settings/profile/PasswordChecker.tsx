import { Check, Dot} from "lucide-react";
import React from "react";

type PasswordCheckerProps = {
  password: string | undefined | null;
};

const rules = [
  { label: "8 caractères", test: (pw: string) => pw?.length >= 8 },
  { label: "Une lettre minuscule", test: (pw: string) => /[a-z]/.test(pw ?? "") },
  { label: "Une lettre majuscule", test: (pw: string) => /[A-Z]/.test(pw ?? "") },
  { label: "Un chiffre", test: (pw: string) => /\d/.test(pw ?? "") },
  { label: "Un caractère spécial", test: (pw: string) => /[^A-Za-z0-9]/.test(pw ?? "") },
];

const PasswordChecker: React.FC<PasswordCheckerProps> = ({ password }) => {
  const safePassword = password ?? "";
  const isPasswordEmpty = safePassword.length === 0;
  
  const validRules = rules.filter(rule => rule.test(safePassword));
  const progress = (validRules.length / rules.length) * 100;

  const getStrengthLabel = () => {
    if (isPasswordEmpty) return "Entrez un mot de passe";
    if (progress === 100) return "✅ Mot de passe fort";
    if (progress >= 60) return "⚠️ Mot de passe moyen";
    return "🔒 Mot de passe faible";
  };

  const getStrengthColor = () => {
    if (isPasswordEmpty) return "bg-gray-200";
    if (progress === 100) return "bg-emerald-500";
    if (progress >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <section className="mt-3 flex flex-col space-y-3 border rounded-lg p-4 bg-muted/10 dark:bg-primary/5">
      {/* Barre de progression */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {getStrengthLabel()}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {validRules.length}/{rules.length}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getStrengthColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Liste des règles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {rules.map((rule) => {
          const isValid = isPasswordEmpty ? false : rule.test(safePassword);

          return (
            <div
              key={rule.label}
              className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                isValid 
                  ? "text-emerald-600 dark:text-emerald-400 font-medium" 
                  : "text-muted-foreground/60"
              }`}
            >
              <span className="flex-shrink-0">
                {isValid ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Dot className="h-3.5 w-3.5 text-muted-foreground/40" />
                )}
              </span>
              <span>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PasswordChecker;