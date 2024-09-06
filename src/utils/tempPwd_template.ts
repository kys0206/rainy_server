export const TempPwdForm = (data: any) => {
  return ` 
<!DOCTYPE html>
<html style="margin: 0; padding: 0;">
<head>
<title>임시비밀번호 발급</title>
</head>
<body style="margin: 0; padding: 0; font-size:15px;">
<div style="background: rgb(255, 255, 255); margin: 0px; padding: 0px; font-family: AppleSDGothicNeo-Regular,Malgun Gothic, 맑은고딕, 돋움, dotum, sans-serif;">
	<div style="background: rgb(255, 255, 255); margin: 0px auto; padding: 0px; width: 100%; letter-spacing: -1px; font-family: AppleSDGothicNeo-Regular,Malgun Gothic, 맑은고딕, 돋움, dotum, sans-serif; max-width: 600px; box-sizing: border-box; -webkit-text-size-adjust: none;">
		<table width="100%" style="margin: 0px; padding: 0px; max-width: 600px;" border="0" cellspacing="0" cellpadding="0">
		<tbody>
		<!-- header -->
		<tr>
			<td height="37" style="margin: 0px; padding: 0px; text-align: center; font-family: AppleSDGothicNeo-Regular,Malgun Gothic, 맑은고딕, 돋움, dotum, sans-serif;">
				<table style="margin: 0px; padding: 0px; width: 100%; font-family: AppleSDGothicNeo-Regular,Malgun Gothic, 맑은고딕, 돋움, dotum, sans-serif;" border="0" cellspacing="0" cellpadding="0">
				<tbody>
				<tr>
					<td align="left" valign="bottom" width="112" height="37">
						<a href="http://localhost:3000" name="rainy_Site" target="_blank" rel="noreferrer noopener">
							<img width="140px" height="auto" style="vertical-align: bottom;" alt="" border="0" src="http://localhost:3000/assets/images/logo.png" loading="lazy">
						</a>
					</td>
				</tr>
				</tbody>
				</table>
			</td>
		</tr>
		<tr>
			<td height="12">
			</td>
		</tr>
		<!-- //header -->
		<!-- container -->
		<tr>
			<td style="background: rgb(246, 247, 251); padding: 0px 16px; border-radius: 20px 20px 0px 0px;">
				<table width="100%" style="margin: 0px; padding: 0px;" border="0" cellspacing="0" cellpadding="0">
				<tbody>
				<tr>
					<td height="64">
					</td>
				</tr>
				<tr>
					<td style="margin: 0px; padding: 0px; text-align: center; color: rgb(0, 0, 0); line-height: 32px; letter-spacing: -1px; font-family: AppleSDGothicNeo-Regular,Malgun Gothic, 맑은고딕, 돋움, dotum, sans-serif; font-size: 24px;">
						<span style="color: rgb(72, 118, 239); font-weight: bold;">임시 비밀번호</span>안내
					</td>
				</tr>
				<tr>
					<td height="48">
					</td>
				</tr>
				<tr>
					<td style="background: rgb(255, 255, 255); padding: 24px 20px 48px; border-radius: 10px; text-align: center;">
						<table width="100%" style="margin: 0px 0px 30px; padding: 0px; font-family: AppleSDGothicNeo-Regular,Malgun Gothic, 맑은고딕, 돋움, dotum, sans-serif;" border="0" cellspacing="0" cellpadding="0">
						<tbody>
						<tr>
							<td align="center" style="padding: 0px 0px 10px; color: rgb(34, 34, 34); line-height: 24px; letter-spacing: -1px; font-family: AppleSDGothicNeo-Regular,Malgun Gothic, 맑은고딕, 돋움, dotum, sans-serif; font-size: 16px; font-weight: bold; border-bottom-color: rgb(222, 225, 234); border-bottom-width: 1px; border-bottom-style: solid;">
								 임시 비밀번호가 발급되었습니다.
							</td>
						</tr>
						<tr>
							<td style="padding: 35px 0px 0px; text-align: center; color: rgb(51, 51, 51); line-height: 24px; font-size: 20px;">
								<strong>${data}</strong>
							</td>
						</tr>
						</tbody>
						</table>
						<p style="margin: 8px 0px 0px; color: rgb(148, 148, 148); line-height: 18px; letter-spacing: -0.5px; font-size: 12px;">
							 * 로그인 후 개인정보 보호를 위해 비밀번호를 변경해주세요. 
						</p>
					</td>
				</tr>
				<tr>
					<td height="64">
					</td>
				</tr>
				</tbody>
				</table>
			</td>
		</tr>
		<!-- //content -->
		<!-- footer -->
		<tr>
			<td bgcolor="#292929">
				<table style="margin: 0px; padding: 0px 16px; width: 100%;" border="0" cellspacing="0" cellpadding="0">
				<tbody>
				<tr>
					<td height="48">
					</td>
				</tr>
				<tr>
					<td align="center">
						<div style="padding: 0px; font-size: 0px;">
							<a href="https://www.facebook.com/%EC%9C%84%EB%93%9C%EB%A9%94%EC%9D%B4%ED%8A%B8-%EB%B3%91%EC%9B%90%EB%8F%99%ED%96%89%EC%84%9C%EB%B9%84%EC%8A%A4-103107278930429" name="ANCHOR47757" target="_blank" rel="noreferrer noopener">
                                <img style="margin: 0px 12px 0px 0px; border: 0px currentColor; width: 30px; vertical-align: top;" alt="페이스북" src="http://www.saraminimage.co.kr/sri/mail/person/icon_facebook.png" loading="lazy">
                            </a>
                            <a href="https://m.blog.naver.com/PostList.naver?blogId=pond909" name="rainy_siteAddress" target="_blank" rel="noreferrer noopener">
                                <img style="border: 0px currentColor; width: 30px; vertical-align: top;" alt="네이버 블로그" src="http://www.saraminimage.co.kr/sri/mail/person/icon_blog.png" loading="lazy">
                            </a>
						</div>
					</td>
				</tr>
				<tr>
					<td height="32">
					</td>
				</tr>
				<tr>
					<td style="padding: 0px 16px; text-align: left; color: rgb(230, 233, 242); line-height: 16px; letter-spacing: -1px; font-family: AppleSDGothicNeo-Regular,Malgun Gothic, 맑은고딕, 돋움, dotum, sans-serif; font-size: 11px;">
						 본 메일은 발신전용 메일입니다. 문의는 
                         <a name="service" style="color: rgb(230, 233, 242); font-family: AppleSDGothicNeo-Regular,Malgun Gothic, 맑은고딕, 돋움, dotum, sans-serif; font-size: 11px; text-decoration: underline;" target="_blank" rel="noreferrer noopener">
                            고객센터
                        </a>를 통해 문의해 주세요.
					</td>
				</tr>
				<tr>
					<td height="16">
					</td>
				</tr>
				<tr>
					<td style="margin: 0px; padding: 0px 16px; text-align: left;">
						<p style="margin: 0px; padding: 0px; color: rgb(230, 233, 242); line-height: 16px; letter-spacing: -1px; font-family: AppleSDGothicNeo-Regular,Malgun Gothic, 맑은고딕, 돋움, dotum, sans-serif; font-size: 11px;">
							 (주) 회사명<br>
							 대표 : 김영석<br>
							 주소 : 서울시 중랑구 동일로 92길 40<br>
							 전화번호 : 010-1111-2222<br>
							 이메일 : abc@abc.com<br>
							 통신판매업 : 2024-서울 중랑구-2092
						</p>
						<p style="margin: 0px; padding: 0px; color: rgb(230, 233, 242); line-height: 16px; letter-spacing: -1px; font-family: AppleSDGothicNeo-Regular,Malgun Gothic, 맑은고딕, 돋움, dotum, sans-serif; font-size: 11px;">
							 Copyright (c) (주) 회사명. All rights reserved.
						</p>
					</td>
				</tr>
				<tr>
					<td height="48">
					</td>
				</tr>
				</tbody>
				</table>
			</td>
		</tr>
		<!-- //footer -->
		</tbody>
		</table>
	</div>
</div>
</body>
</html>
    `
}
module.exports = {TempPwdForm}
