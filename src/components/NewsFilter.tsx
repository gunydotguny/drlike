import { Box, TextField, Button } from "@mui/material";

export default function NewsFilter({ filters, setFilters }: any) {
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
      <TextField
        label="키워드"
        size="small"
        value={filters.q}
        onChange={(e) => setFilters((f: any) => ({ ...f, q: e.target.value }))}
      />
      <TextField
        type="date"
        size="small"
        label="시작일"
        InputLabelProps={{ shrink: true }}
        value={filters.start}
        onChange={(e) => setFilters((f: any) => ({ ...f, start: e.target.value }))}
      />
      <TextField
        type="date"
        size="small"
        label="종료일"
        InputLabelProps={{ shrink: true }}
        value={filters.end}
        onChange={(e) => setFilters((f: any) => ({ ...f, end: e.target.value }))}
      />
      <Button
        variant="contained"
        onClick={() => setFilters({ ...filters })}
        sx={{ bgcolor: "#333" }}
      >
        검색
      </Button>
    </Box>
  );
}
