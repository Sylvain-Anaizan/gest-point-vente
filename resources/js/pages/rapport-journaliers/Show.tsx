import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, User, ArrowLeft, Pencil } from 'lucide-react';
import RapportJournalierController from '@/actions/App/Http/Controllers/RapportJournalierController';

interface Rapport {
    id: number;
    user_id: number;
    date_rapport: string;
    contenu: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
}

export default function Show({ rapport }: { rapport: Rapport }) {
    // Note: We'd normally use auth from usePage, but let's keep it simple for now
    // and just rely on the controller to handle authorization.

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Rapports Journaliers', href: '/rapport-journaliers' },
                { title: 'Détails', href: `/rapport-journaliers/${rapport.id}` }
            ]}
        >
            <Head title={`Rapport du ${format(new Date(rapport.date_rapport), 'd MMMM yyyy', { locale: fr })}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <Button variant="outline" asChild>
                        <Link href="/rapport-journaliers" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Retour à la liste</span>
                        </Link>
                    </Button>

                    <div className="flex gap-2">
                        <Link href={RapportJournalierController.edit.url(rapport.id)}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Pencil className="h-4 w-4" />
                                <span>Modifier</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="bg-muted/50 border-b dark:border-zinc-800">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl flex items-center gap-2 font-bold">
                                    <Calendar className="h-6 w-6 text-primary" />
                                    Rapport du {format(new Date(rapport.date_rapport), 'EEEE d MMMM yyyy', { locale: fr })}
                                </CardTitle>
                                {rapport.user && (
                                    <CardDescription className="flex items-center gap-1.5 text-base font-medium text-foreground/80">
                                        <User className="h-4 w-4" />
                                        {rapport.user.name}
                                    </CardDescription>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border">
                                Créé le {format(new Date(rapport.created_at), 'd MMMM yyyy à HH:mm', { locale: fr })}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 pb-10">
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: rapport.contenu }}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
