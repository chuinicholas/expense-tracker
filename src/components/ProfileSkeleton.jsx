import { Box, Skeleton, Stack, Paper, Card, CardContent } from "@mui/material";

export default function ProfileSkeleton() {
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Stack spacing={4}>
        {/* Profile Header Skeleton */}
        <Box sx={{ textAlign: "center" }}>
          <Skeleton
            variant="circular"
            width={100}
            height={100}
            sx={{ mx: "auto", mb: 2 }}
          />
          <Skeleton
            variant="text"
            width={200}
            height={40}
            sx={{ mx: "auto", mb: 1 }}
          />
          <Skeleton
            variant="text"
            width={150}
            height={24}
            sx={{ mx: "auto" }}
          />
        </Box>

        <Skeleton variant="text" width="100%" />

        {/* Profile Cards Skeleton */}
        <Stack spacing={3}>
          {[1, 2, 3].map((item) => (
            <Card key={item} variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={24} height={24} />
                    <Box>
                      <Skeleton variant="text" width={100} height={20} />
                      <Skeleton variant="text" width={150} height={30} />
                    </Box>
                  </Stack>
                  <Skeleton variant="circular" width={40} height={40} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
