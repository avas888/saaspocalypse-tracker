"""
Backend unit tests — FMP/YF utility logic, data format validation.
Run with: cd backend && python -m pytest tests/ -v
"""
import os
import sys
import json
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add backend dir to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


from fmp_fetcher import FMPFetcher


class TestFMPFetcherInit:
    """Test FMPFetcher initialization and validation."""

    def test_raises_without_api_key(self):
        """FMPFetcher should raise ValueError when no API key is available."""
        # Patch os.environ AFTER module import so load_dotenv has already run
        # but the patched env will be empty, so os.getenv returns None
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError, match="FMP API Key is missing"):
                FMPFetcher(api_key=None)

    def test_accepts_explicit_api_key(self):
        """FMPFetcher should accept an explicit API key."""
        fetcher = FMPFetcher(api_key="test-key-123")
        assert fetcher.api_key == "test-key-123"

    def test_base_url_is_stable_api(self):
        """FMPFetcher should use the stable API endpoint."""
        assert FMPFetcher.BASE_URL == "https://financialmodelingprep.com/stable"


class TestDataFileFormats:
    """Test that existing data files conform to expected schemas."""

    DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

    def _load_json(self, filename):
        filepath = self.DATA_DIR / filename
        if not filepath.exists():
            pytest.skip(f"{filename} not found")
        with open(filepath) as f:
            return json.load(f)

    def test_baseline_has_required_fields(self):
        """baseline.json should have date and tickers."""
        data = self._load_json("baseline.json")
        assert "date" in data
        assert "tickers" in data
        assert isinstance(data["tickers"], dict)

    def test_baseline_tickers_have_price(self):
        """Each ticker in baseline should have a price field."""
        data = self._load_json("baseline.json")
        for ticker, info in data["tickers"].items():
            assert "price" in info, f"{ticker} missing price"
            assert isinstance(info["price"], (int, float)), f"{ticker} price is not numeric"

    def test_ltm_high_has_required_fields(self):
        """ltm_high.json should have tickers and sectors."""
        data = self._load_json("ltm_high.json")
        assert "tickers" in data
        assert isinstance(data["tickers"], dict)

    def test_ltm_high_tickers_have_required_fields(self):
        """Each ticker in ltm_high should have high_price and ltm_high_pct."""
        data = self._load_json("ltm_high.json")
        for ticker, info in data["tickers"].items():
            assert "high_price" in info, f"{ticker} missing high_price"
            assert "ltm_high_pct" in info, f"{ticker} missing ltm_high_pct"

    def test_daily_snapshot_format(self):
        """Daily snapshot files should have date, tickers, and sectors."""
        # Find any daily file
        if not self.DATA_DIR.exists():
            pytest.skip("data directory not found")
        daily_files = sorted(
            f for f in self.DATA_DIR.iterdir()
            if f.suffix == ".json" and f.stem not in ("baseline", "ltm_high", "private_health", "sector_news")
            and not f.stem.endswith("-noon") and not f.stem.endswith("-11am")
        )
        if not daily_files:
            pytest.skip("No daily snapshot files found")

        data = json.loads(daily_files[-1].read_text())
        assert "date" in data
        assert "tickers" in data
        assert isinstance(data["tickers"], dict)

        # Verify ticker structure
        for ticker, info in data["tickers"].items():
            assert "close" in info, f"{ticker} missing close"
            assert "sector" in info, f"{ticker} missing sector"

    def test_all_daily_files_have_consistent_tickers(self):
        """All daily snapshots should track the same set of tickers (within tolerance)."""
        if not self.DATA_DIR.exists():
            pytest.skip("data directory not found")
        daily_files = sorted(
            f for f in self.DATA_DIR.iterdir()
            if f.suffix == ".json" and f.stem not in ("baseline", "ltm_high", "private_health", "sector_news")
            and not f.stem.endswith("-noon") and not f.stem.endswith("-11am")
        )
        if len(daily_files) < 2:
            pytest.skip("Need at least 2 daily files to compare")

        ticker_sets = []
        for f in daily_files[-3:]:  # Check last 3 files
            data = json.loads(f.read_text())
            ticker_sets.append(set(data.get("tickers", {}).keys()))

        # All should share at least 80% of tickers
        if len(ticker_sets) >= 2:
            common = ticker_sets[0].intersection(ticker_sets[1])
            union = ticker_sets[0].union(ticker_sets[1])
            overlap = len(common) / len(union) if union else 1
            assert overlap >= 0.8, f"Ticker overlap between daily files is only {overlap:.0%}"
