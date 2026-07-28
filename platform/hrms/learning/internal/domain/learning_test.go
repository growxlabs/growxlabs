package domain

import "testing"

func TestProgress(t *testing.T) {
	cases := []struct {
		done, total int
		want        float64
	}{{0, 4, 0}, {1, 4, 25}, {2, 3, 66.67}, {4, 4, 100}, {0, 0, 100}}
	for _, c := range cases {
		if got := Progress(c.done, c.total); got != c.want {
			t.Fatalf("Progress(%d,%d)=%v want %v", c.done, c.total, got, c.want)
		}
	}
}
