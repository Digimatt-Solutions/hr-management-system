import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, fullName, statusVariant, titleCase } from "@/lib/hr";
import { Star } from "lucide-react";

interface Cycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  description: string | null;
}

interface Review {
  id: string;
  employee_id: string;
  cycle_id: string;
  overall_rating: number | null;
  status: string;
  employees: { first_name: string; last_name: string } | null;
  reviewer: { first_name: string; last_name: string } | null;
}

const Performance = () => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [c, r] = await Promise.all([
      supabase
        .from("review_cycles")
        .select("id, name, start_date, end_date, status, description")
        .order("start_date", { ascending: false }),
      supabase
        .from("performance_reviews")
        .select(
          "id, employee_id, cycle_id, overall_rating, status, employees(first_name, last_name), reviewer:reviewer_id(first_name, last_name)",
        )
        .order("created_at", { ascending: false }),
    ]);
    setCycles((c.data as Cycle[]) ?? []);
    setReviews((r.data as unknown as Review[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <DashboardLayout title="Performance" description="Review cycles and appraisals">
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cycles.map((cycle) => (
              <Card key={cycle.id}>
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{cycle.name}</CardTitle>
                    <Badge variant={statusVariant(cycle.status)}>{titleCase(cycle.status)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(cycle.start_date)} – {formatDate(cycle.end_date)}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {cycle.description || "No description"}
                  </p>
                  <p className="mt-2 text-sm">
                    {reviews.filter((r) => r.cycle_id === cycle.id).length} reviews
                  </p>
                </CardContent>
              </Card>
            ))}
            {cycles.length === 0 && (
              <p className="text-sm text-muted-foreground">No review cycles yet.</p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <Link
                          to={`/employees/${review.employee_id}/reviews`}
                          className="font-medium hover:underline"
                        >
                          {fullName(review.employees)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {cycles.find((c) => c.id === review.cycle_id)?.name ?? "—"}
                      </TableCell>
                      <TableCell>{fullName(review.reviewer)}</TableCell>
                      <TableCell>
                        {review.overall_rating !== null ? (
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-primary" /> {review.overall_rating}/5
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(review.status)}>
                          {titleCase(review.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reviews.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No reviews recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Performance;
