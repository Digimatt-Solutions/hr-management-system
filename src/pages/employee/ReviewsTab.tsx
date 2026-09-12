import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEmployeeContext } from "@/pages/EmployeeDetail";
import { formatDate, statusVariant, titleCase } from "@/lib/hr";
import { Star } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  progress: number;
  status: string;
  target_date: string | null;
}

interface Review {
  id: string;
  overall_rating: number | null;
  strengths: string | null;
  improvements: string | null;
  status: string;
  submitted_at: string | null;
  review_cycles: { name: string; start_date: string; end_date: string } | null;
  review_goals: Goal[];
}

const ReviewsTab = () => {
  const { employee } = useEmployeeContext();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("performance_reviews")
        .select(
          "id, overall_rating, strengths, improvements, status, submitted_at, review_cycles(name, start_date, end_date), review_goals(id, title, progress, status, target_date)",
        )
        .eq("employee_id", employee.id)
        .order("created_at", { ascending: false });
      setReviews((data as unknown as Review[]) ?? []);
    };
    load();
  }, [employee.id]);

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No performance reviews yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">{review.review_cycles?.name ?? "Review"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {review.review_cycles
                  ? `${formatDate(review.review_cycles.start_date)} – ${formatDate(review.review_cycles.end_date)}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {review.overall_rating !== null && (
                <span className="flex items-center gap-1 text-sm font-medium">
                  <Star className="h-4 w-4 text-primary" /> {review.overall_rating}/5
                </span>
              )}
              <Badge variant={statusVariant(review.status)}>{titleCase(review.status)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Strengths</p>
                <p className="text-sm text-muted-foreground">{review.strengths || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Areas to improve</p>
                <p className="text-sm text-muted-foreground">{review.improvements || "—"}</p>
              </div>
            </div>
            {review.review_goals?.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Goals</p>
                {review.review_goals.map((goal) => (
                  <div key={goal.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{goal.title}</p>
                      <Badge variant="outline">{titleCase(goal.status)}</Badge>
                    </div>
                    <Progress value={goal.progress} className="mt-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {goal.progress}% · due {formatDate(goal.target_date)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReviewsTab;
