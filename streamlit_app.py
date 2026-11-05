from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


ROOT = Path(__file__).parent
preview = (ROOT / "preview.html").read_text(encoding="utf-8")

st.set_page_config(page_title="오케퐁 IT Help Desk", layout="wide")
components.html(preview, height=920, scrolling=True)
