import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { format, subDays, startOfToday, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

import RichTextEditor from '@/components/RichTextEditor';
import { Save, AlertCircle, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Create() {
    const today = startOfToday();
    const availableDates = eachDayOfInterval({
        start: subDays(today, 7),
        end: today
    }).reverse();

    const { data, setData, post, processing, errors } = useForm({
        contenu: '',
        date_rapport: format(today, 'yyyy-MM-dd'),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/rapport-journaliers');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Rapports Journaliers', href: '/rapport-journaliers' },
                { title: 'Nouveau', href: '/rapport-journaliers/create' }
            ]}
        >
            <Head title="Nouveau Rapport" />

            <div className="flex justify-center py-6">
                <Card className="w-full max-w-5xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Save className="h-6 w-6 text-primary" />
                            Nouveau Rapport Journalier
                        </CardTitle>
                        <CardDescription>Remplissez votre compte rendu d'activité.</CardDescription>
                    </CardHeader>

                    <form onSubmit={submit}>
                        <CardContent className="space-y-4">
                            {errors.contenu && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{errors.contenu}</AlertDescription>
                                </Alert>
                            )}

                            {errors.date_rapport && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{errors.date_rapport}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="date_rapport">Date du rapport</Label>
                                <Select
                                    value={data.date_rapport}
                                    onValueChange={(value) => setData('date_rapport', value)}
                                >
                                    <SelectTrigger id="date_rapport" className="w-[280px]">
                                        <Calendar className="mr-2 h-4 w-4 opacity-50" />
                                        <SelectValue placeholder="Choisir une date" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableDates.map((date) => (
                                            <SelectItem key={format(date, 'yyyy-MM-dd')} value={format(date, 'yyyy-MM-dd')}>
                                                {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Vous pouvez saisir un rapport pour les 7 derniers jours.
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
                                {processing ? 'Enregistrement...' : 'Enregistrer le rapport'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
