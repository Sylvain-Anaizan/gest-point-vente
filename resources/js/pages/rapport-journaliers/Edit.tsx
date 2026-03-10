import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import RichTextEditor from '@/components/RichTextEditor';
import { Save, AlertCircle, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

interface Rapport {
    id: number;
    date_rapport: string;
    contenu: string;
}

export default function Edit({ rapport }: { rapport: Rapport }) {
    const { data, setData, put, processing, errors } = useForm({
        contenu: rapport.contenu,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/rapport-journaliers/${rapport.id}`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Rapports Journaliers', href: '/rapport-journaliers' },
                { title: 'Modifier', href: `/rapport-journaliers/${rapport.id}/edit` }
            ]}
        >
            <Head title="Modifier le Rapport" />

            <div className="flex justify-center py-6">
                <Card className="w-full max-w-5xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Save className="h-6 w-6 text-primary" />
                            Modifier le Rapport Journalier
                        </CardTitle>
                        <CardDescription>Mettez à jour votre compte rendu d'activité.</CardDescription>
                    </CardHeader>

                    <form onSubmit={submit}>
                        <CardContent className="space-y-4">
                            {errors.contenu && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{errors.contenu}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label>Date du rapport</Label>
                                <div className="flex items-center gap-2 text-sm font-medium border rounded-md px-3 py-2 bg-muted/50 w-[280px]">
                                    <Calendar className="h-4 w-4 opacity-50" />
                                    {format(new Date(rapport.date_rapport), 'EEEE d MMMM yyyy', { locale: fr })}
                                </div>
                                <p className="text-xs text-muted-foreground italic">
                                    La date ne peut pas être modifiée après création.
                                </p>
                            </div>

                            <div className="min-h-[300px]">
                                <RichTextEditor
                                    value={data.contenu}
                                    onChange={(content) => setData('contenu', content)}
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-end border-t pt-4">
                            <Button
                                type="submit"
                                disabled={processing || !data.contenu || data.contenu === '<p><br></p>'}
                                className="gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {processing ? 'Mise à jour...' : 'Mettre à jour le rapport'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
