'use client';

import { useState, useEffect } from 'react';
import { googleBusinessApi, GmbAccount, GmbLocation, GmbReview } from '@/lib/google-business-api';
import { signInWithGoogle, supabase, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export default function GoogleBusinessTestPage() {
    const [user, setUser] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [accounts, setAccounts] = useState<GmbAccount[]>([]);
    const [locations, setLocations] = useState<GmbLocation[]>([]);
    const [reviews, setReviews] = useState<GmbReview[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [replyText, setReplyText] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user);
        });

        return () => subscription.unsubscribe();
    }, []);

    const addLog = (message: string, data?: any) => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}`;
        setLogs(prev => [logEntry, ...prev]);
    };

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            addLog("Login Error", error);
        }
    };

    const handleLogout = async () => {
        await signOut();
        setAccounts([]);
        setLocations([]);
        setReviews([]);
        addLog("Logged out");
    };

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            addLog("Fetching accounts...");
            const data = await googleBusinessApi.getAccounts();
            setAccounts(data);
            addLog("Accounts fetched", data);
        } catch (error: any) {
            addLog("Error fetching accounts", error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchLocations = async (accountName: string) => {
        setLoading(true);
        setSelectedAccount(accountName);
        try {
            addLog(`Fetching locations for ${accountName}...`);
            const data = await googleBusinessApi.getLocations(accountName);
            setLocations(data);
            addLog("Locations fetched", data);
        } catch (error: any) {
            addLog("Error fetching locations", error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async (locationName: string) => {
        setLoading(true);
        setSelectedLocation(locationName);
        try {
            addLog(`Fetching reviews for ${locationName}...`);
            const data = await googleBusinessApi.getReviews(locationName);
            setReviews(data);
            addLog("Reviews fetched", data);
        } catch (error: any) {
            addLog("Error fetching reviews", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (reviewName: string) => {
        if (!replyText) return;
        setLoading(true);
        try {
            addLog(`Replying to ${reviewName}...`);
            const res = await googleBusinessApi.replyToReview(reviewName, replyText);
            addLog("Reply success", res);
            setReplyText('');
            // Refresh reviews
            fetchReviews(selectedLocation);
        } catch (error: any) {
            addLog("Error replying", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 space-y-8">
            <h1 className="text-3xl font-bold mb-4">Google Business Profile Test</h1>

            {/* 1. Authentication */}
            <Card>
                <CardHeader>
                    <CardTitle>1. Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <p className="text-green-600">Logged in as: {user.email}</p>
                                <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
                            </>
                        ) : (
                            <Button onClick={handleLogin}>Sign In with Google (Review Scopes)</Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 2. Accounts */}
            <Card className={!user ? "opacity-50 pointer-events-none" : ""}>
                <CardHeader>
                    <CardTitle>2. Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={fetchAccounts} disabled={loading}>Fetch Accounts</Button>
                    <div className="mt-4 grid gap-2">
                        {accounts.map(acc => (
                            <div key={acc.name} className={`p-4 border rounded cursor-pointer ${selectedAccount === acc.name ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                                onClick={() => fetchLocations(acc.name)}>
                                <p className="font-bold">{acc.accountName}</p>
                                <p className="text-xs text-gray-500">{acc.name}</p>
                                <p className="text-xs text-gray-500">Type: {acc.type}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 3. Locations */}
            <Card className={!selectedAccount ? "opacity-50 pointer-events-none" : ""}>
                <CardHeader>
                    <CardTitle>3. Locations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        {locations.length === 0 && selectedAccount && !loading && (
                            <p className="text-gray-500">No locations found for this account. Try selecting a different account (e.g. a Location Group).</p>
                        )}
                        {locations.map(loc => (
                            <div key={loc.name} className={`p-4 border rounded cursor-pointer ${selectedLocation === loc.name ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                                onClick={() => fetchReviews(loc.name)}>
                                <p className="font-bold">{loc.title}</p>
                                <p className="text-xs text-gray-500">{loc.name}</p>
                                {loc.metadata?.mapsUri && (
                                    <a href={loc.metadata.mapsUri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline" onClick={(e) => e.stopPropagation()}>View on Maps</a>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 4. Reviews */}
            <Card className={!selectedLocation ? "opacity-50 pointer-events-none" : ""}>
                <CardHeader>
                    <CardTitle>4. Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reviews.length === 0 && <p className="text-gray-500">No reviews found or not fetched.</p>}
                        {reviews.map(review => (
                            <div key={review.reviewId} className="border p-4 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="font-bold">{review.reviewer.displayName}</div>
                                    <div className="text-yellow-500">{review.starRating}</div>
                                    <div className="text-xs text-gray-400">{review.createTime}</div>
                                </div>
                                <p className="mb-4">{review.comment}</p>

                                {review.reviewReply ? (
                                    <div className="bg-gray-50 p-3 rounded text-sm">
                                        <p className="font-bold mb-1">Reply:</p>
                                        <p>{review.reviewReply.comment}</p>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Write a reply..."
                                            className="border p-2 rounded flex-1"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        />
                                        <Button onClick={() => handleReply(review.name)} disabled={loading}>Reply</Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Logs Area */}
            <Card className="bg-slate-900 text-slate-100">
                <CardHeader>
                    <CardTitle className="text-white">Debug Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] overflow-y-auto">
                        <pre className="text-xs font-mono">
                            {logs.join('\n\n')}
                        </pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
